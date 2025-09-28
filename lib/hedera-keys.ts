import { PrivateKey } from "@hashgraph/sdk";
import crypto from 'crypto';

// Encryption key (store securely in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-dev-only';

export function generateHederaKeys() {
  const privateKey = PrivateKey.generateECDSA();
  const publicKey = privateKey.publicKey;
  const evmAddress = publicKey.toEvmAddress();
  
  return {
    privateKey,
    publicKey,
    evmAddress
  };
}

export function encryptPrivateKey(privateKey: PrivateKey): string {
  return privateKey.toStringDer();   // store directly
}

export function decryptPrivateKey(raw: string): PrivateKey {
  return PrivateKey.fromStringDer(raw);   // read directly
}