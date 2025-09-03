// lib/ipfs.ts
export const getIPFSGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  // Use environment variable with fallback
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
  
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', `${gateway}/ipfs/`);
  }
  
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('baf')) {
    return `${gateway}/ipfs/${ipfsUrl}`;
  }
  
  // Return as-is if it's already a URL
  return ipfsUrl;
};