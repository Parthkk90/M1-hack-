import * as bip39 from 'bip39';
import {derivePath} from 'ed25519-hd-key';
import nacl from 'tweetnacl';

export class CryptoService {
  /**
   * Generate a new mnemonic phrase (12 words)
   */
  generateMnemonic(): string {
    return bip39.generateMnemonic(128); // 128 bits = 12 words
  }

  /**
   * Validate mnemonic phrase
   */
  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Derive key pair from mnemonic
   * Uses BIP44 path: m/44'/637'/0'/0'/0' (637 is Aptos/Movement coin type)
   */
  async deriveKeyPairFromMnemonic(
    mnemonic: string,
    accountIndex: number = 0,
  ): Promise<KeyPair> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Derive key using BIP44 path
    const path = `m/44'/637'/${accountIndex}'/0'/0'`;
    const {key} = derivePath(path, Buffer.from(seed).toString('hex'));

    // Generate Ed25519 keypair
    const keyPair = nacl.sign.keyPair.fromSeed(key);

    return {
      privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
      publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    };
  }

  /**
   * Derive address from public key
   * Aptos address = SHA3-256(public_key | 0x00) where 0x00 is the single-sig scheme
   */
  deriveAddress(publicKeyHex: string): string {
    const {sha3_256} = require('js-sha3');
    
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const authKeyScheme = Buffer.from([0x00]); // Single signature scheme
    
    const authKey = Buffer.concat([publicKey, authKeyScheme]);
    const hash = sha3_256(authKey);
    
    return `0x${hash}`;
  }

  /**
   * Sign message with private key
   */
  async signMessage(privateKeyHex: string, message: Uint8Array): Promise<Uint8Array> {
    const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
    
    // Ed25519 private key is 64 bytes (32 seed + 32 public), we need the full key
    const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes.slice(0, 32));
    const signature = nacl.sign.detached(message, keyPair.secretKey);
    
    return signature;
  }

  /**
   * Verify signature
   */
  async verifySignature(
    publicKeyHex: string,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  /**
   * Generate random bytes
   */
  generateRandomBytes(length: number): Uint8Array {
    return nacl.randomBytes(length);
  }
}

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export const cryptoService = new CryptoService();
