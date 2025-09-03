// app/api/nft/mint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  Hbar,
  Client,
  AccountId,
  PrivateKey,
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";
import { uploadToIPFS } from '@/lib/ipfs';

// Flexible private key parser from your example
function parsePriv(str: string) {
  try {
    return PrivateKey.fromStringDer(str);
  } catch {
    return PrivateKey.fromStringDer(str);
  }
}

export async function POST(request: NextRequest) {
  let client: Client | null = null;
  
  try {
    const { playlistId, name, description, userId, userEmail, recipientAccountId } = await request.json();

    // Validate environment variables
    if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY || 
        !process.env.HEDERA_TOKEN_ID || !process.env.HEDERA_SUPPLY_KEY) {
      throw new Error('Hedera environment variables are not set');
    }

    // Initialize Hedera client
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = parsePriv(process.env.HEDERA_OPERATOR_KEY);
    
    client = Client.forTestnet().setOperator(operatorId, operatorKey);
    client.setDefaultMaxTransactionFee(new Hbar(20));

    // Get token ID and supply key from environment
    const tokenId = process.env.HEDERA_TOKEN_ID;
    const supplyKey = parsePriv(process.env.HEDERA_SUPPLY_KEY);

    const metadata = {
  name: name,
  creator: userEmail || userId,
  creatorDID: `did:hedera:testnet:${userId}_0.0.123`,
  description: description || 'A music playlist',
  image: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/default-playlist-image.png`,
  type: "audio/mpeg",
  format: "HIP412@2.0.0",
  properties: {
    external_url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}`,
    playlist_id: playlistId,
  },
  attributes: [
    {
      trait_type: "type",
      value: "playlist"
    },
    {
      trait_type: "song_count",
      value: 0
    }
  ]
};

// Upload metadata to IPFS using the simplified approach
const metadataCid = await uploadToIPFS(metadata);
const metadataUri = `ipfs://${metadataCid}`;

// Convert metadata URI to buffer
const metadataBuffer = Buffer.from(metadataUri);

    // Mint the NFT using the existing token
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBuffer])
      .freezeWith(client);

    // Sign with the supply key
    const mintTxSign = await mintTx.sign(supplyKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);

    // Get the serial number
    const serialNumber = mintRx.serials[0].toString();

    // If a recipient account is specified, transfer the NFT to them
    if (recipientAccountId) {
      const recipientId = AccountId.fromString(recipientAccountId);
      
      // Transfer the NFT from treasury to recipient
      const transferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, parseInt(serialNumber), operatorId, recipientId)
        .freezeWith(client)
        .sign(operatorKey);

      const transferSubmit = await transferTx.execute(client);
      const transferRx = await transferSubmit.getReceipt(client);
      
      console.log(`NFT transferred to ${recipientAccountId}: ${transferRx.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      tokenId: tokenId, 
      serialNumber: serialNumber,
      metadataUri: metadataUri
    });
  } catch (error) {
    // Proper error handling
    let errorMessage = 'Failed to mint NFT';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error('NFT minting error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Close the client connection
    if (client) {
      try {
        await client.close();
      } catch (e) {
        console.error('Error closing Hedera client:', e);
      }
    }
  }
}