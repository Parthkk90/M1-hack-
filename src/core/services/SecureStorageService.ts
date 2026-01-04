import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

export class SecureStorageService {
  private readonly SERVICE_NAME = 'crescaWallet';
  
  // Storage keys
  private readonly MNEMONIC_KEY = 'mnemonic';
  private readonly PRIVATE_KEY_KEY = 'private_key';
  private readonly PUBLIC_KEY_KEY = 'public_key';
  private readonly ADDRESS_KEY = 'address';
  private readonly PIN_HASH_KEY = 'pin_hash';

  /**
   * Encrypt data using password
   */
  private encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }

  /**
   * Decrypt data using password
   */
  private decrypt(encryptedData: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Store mnemonic securely
   */
  async storeMnemonic(mnemonic: string, password: string): Promise<void> {
    const encrypted = this.encrypt(mnemonic, password);
    await Keychain.setGenericPassword(
      this.MNEMONIC_KEY,
      encrypted,
      {
        service: `${this.SERVICE_NAME}_${this.MNEMONIC_KEY}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
  }

  /**
   * Get mnemonic
   */
  async getMnemonic(password: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_NAME}_${this.MNEMONIC_KEY}`,
      });

      if (!credentials) {
        return null;
      }

      const decrypted = this.decrypt(credentials.password, password);
      return decrypted || null;
    } catch (error) {
      console.error('Error retrieving mnemonic:', error);
      return null;
    }
  }

  /**
   * Store private key securely
   */
  async storePrivateKey(privateKey: string, password: string): Promise<void> {
    const encrypted = this.encrypt(privateKey, password);
    await Keychain.setGenericPassword(
      this.PRIVATE_KEY_KEY,
      encrypted,
      {
        service: `${this.SERVICE_NAME}_${this.PRIVATE_KEY_KEY}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
  }

  /**
   * Get private key
   */
  async getPrivateKey(password: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PRIVATE_KEY_KEY}`,
      });

      if (!credentials) {
        return null;
      }

      const decrypted = this.decrypt(credentials.password, password);
      return decrypted || null;
    } catch (error) {
      console.error('Error retrieving private key:', error);
      return null;
    }
  }

  /**
   * Store public key
   */
  async storePublicKey(publicKey: string): Promise<void> {
    await Keychain.setGenericPassword(
      this.PUBLIC_KEY_KEY,
      publicKey,
      {
        service: `${this.SERVICE_NAME}_${this.PUBLIC_KEY_KEY}`,
        accessible: Keychain.ACCESSIBLE.ALWAYS,
      },
    );
  }

  /**
   * Get public key
   */
  async getPublicKey(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PUBLIC_KEY_KEY}`,
      });

      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Error retrieving public key:', error);
      return null;
    }
  }

  /**
   * Store address
   */
  async storeAddress(address: string): Promise<void> {
    await Keychain.setGenericPassword(
      this.ADDRESS_KEY,
      address,
      {
        service: `${this.SERVICE_NAME}_${this.ADDRESS_KEY}`,
        accessible: Keychain.ACCESSIBLE.ALWAYS,
      },
    );
  }

  /**
   * Get address
   */
  async getAddress(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_NAME}_${this.ADDRESS_KEY}`,
      });

      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Error retrieving address:', error);
      return null;
    }
  }

  /**
   * Check if wallet exists
   */
  async hasWallet(): Promise<boolean> {
    const address = await this.getAddress();
    return address !== null;
  }

  /**
   * Store PIN hash
   */
  async storePinHash(pinHash: string): Promise<void> {
    await Keychain.setGenericPassword(
      this.PIN_HASH_KEY,
      pinHash,
      {
        service: `${this.SERVICE_NAME}_${this.PIN_HASH_KEY}`,
        accessible: Keychain.ACCESSIBLE.ALWAYS,
      },
    );
  }

  /**
   * Get PIN hash
   */
  async getPinHash(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PIN_HASH_KEY}`,
      });

      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Error retrieving PIN hash:', error);
      return null;
    }
  }

  /**
   * Verify PIN
   */
  async verifyPin(pin: string): Promise<boolean> {
    const storedHash = await this.getPinHash();
    if (!storedHash) {
      return false;
    }

    const pinHash = CryptoJS.SHA256(pin).toString();
    return pinHash === storedHash;
  }

  /**
   * Delete all wallet data
   */
  async deleteWallet(): Promise<void> {
    await Promise.all([
      Keychain.resetGenericPassword({
        service: `${this.SERVICE_NAME}_${this.MNEMONIC_KEY}`,
      }),
      Keychain.resetGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PRIVATE_KEY_KEY}`,
      }),
      Keychain.resetGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PUBLIC_KEY_KEY}`,
      }),
      Keychain.resetGenericPassword({
        service: `${this.SERVICE_NAME}_${this.ADDRESS_KEY}`,
      }),
      Keychain.resetGenericPassword({
        service: `${this.SERVICE_NAME}_${this.PIN_HASH_KEY}`,
      }),
    ]);
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await this.deleteWallet();
  }
}

export const secureStorageService = new SecureStorageService();
