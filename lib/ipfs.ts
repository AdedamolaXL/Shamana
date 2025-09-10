import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK({ 
  pinataJWTKey: process.env.PINATA_JWT 
});

export async function uploadToIPFS(data: any) {
  try {
    console.log('Uploading metadata to IPFS using Pinata SDK...');
    
    const options = {
      pinataMetadata: {
        name: `playlist-metadata-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    
    const result = await pinata.pinJSONToIPFS(data, options);
    console.log('IPFS upload successful, CID:', result.IpfsHash);
    
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}