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
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', 
    crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(privateKey.toStringDer(), 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  });
}

export function decryptPrivateKey(encryptedData: string): PrivateKey {
  const data = JSON.parse(encryptedData);
  const iv = Buffer.from(data.iv, 'hex');
  const encrypted = Buffer.from(data.encrypted, 'hex');
  const authTag = Buffer.from(data.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', 
    crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return PrivateKey.fromStringDer(decrypted.toString('utf8'));
}