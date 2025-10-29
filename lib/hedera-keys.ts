import { PrivateKey } from "@hashgraph/sdk";

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
  return privateKey.toStringDer();   
}

export function decryptPrivateKey(raw: string): PrivateKey {
  return PrivateKey.fromStringDer(raw);   
}