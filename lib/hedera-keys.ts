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
  // Use DER format and base64 encoding consistently
  const privateKeyDer = privateKey.toStringDer();
  return Buffer.from(privateKeyDer).toString('base64');
}

export function decryptPrivateKey(encryptedKey: string): PrivateKey {
  // Convert from base64 back to DER
  const privateKeyDer = Buffer.from(encryptedKey, 'base64').toString('utf8');
  return PrivateKey.fromStringDer(privateKeyDer);
}

// NEW: Enhanced HashPack key conversion with debugging
export function convertToHashPackFormat(privateKey: PrivateKey): string {
  try {
    console.log("=== HashPack Key Conversion Debug ===");
    
    // Try multiple formats to see what works
    const formats = {
      raw: privateKey.toStringRaw(),
      der: privateKey.toStringDer(),
      derHex: Buffer.from(privateKey.toStringDer()).toString('hex'),
      derBase64: Buffer.from(privateKey.toStringDer()).toString('base64')
    };
    
    console.log("Available key formats:", formats);
    
    // HashPack typically expects the raw private key in hex format
    const rawPrivateKey = privateKey.toStringRaw();
    console.log("Using raw format for HashPack:", rawPrivateKey);
    console.log("Raw key length:", rawPrivateKey.length);
    
    return rawPrivateKey;
  } catch (error) {
    console.error("Error converting to HashPack format:", error);
    throw new Error("Failed to convert private key for HashPack");
  }
}

// NEW: Generate HashPack-compatible export data
export function generateHashPackExport(
  privateKey: PrivateKey, 
  accountId: string
) {
  const hashPackPrivateKey = convertToHashPackFormat(privateKey);
  
  return {
    privateKey: hashPackPrivateKey,
    accountId: accountId,
    network: process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
    type: "hedera",
    format: "raw"
  };
}

// NEW: Alternative method - try EVM private key format
export function convertToEVMFormat(privateKey: PrivateKey): string {
  try {
    // Some wallets expect the EVM-style private key (with 0x prefix)
    const rawKey = privateKey.toStringRaw();
    const evmFormattedKey = `0x${rawKey}`;
    console.log("EVM formatted key:", evmFormattedKey);
    return evmFormattedKey;
  } catch (error) {
    console.error("Error converting to EVM format:", error);
    throw error;
  }
}