#!/bin/bash
aptos move run \
  --function-id 0xf5fe51c654d6475b8bf41bd0697a81fec15dbfb5488e83970d98badcaaec97a1::payments::batch_send \
  --args \
    'vector<address>:[0xba47b1ef735efee3e6649d93134171c61e59fc8eeb02a0c8762fc1608469bd55,0x5003f5c306077e4b0798546e4f719ed0efb2ef94ad431b1f1c1450aabf57f7b7]' \
    'vector<u64>:[20000000,20000000]' \
  --url https://testnet.movementnetwork.xyz/v1 \
  --private-key 0x4D0EFE6773051213CA4547FEE40C37FDE71BE25D99C2E8412507A0D9CEF2BE4B \
  --assume-yes
