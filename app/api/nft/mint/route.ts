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
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { activateHederaAccount } from '@/lib/hedera-account'; 

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
    const { playlistId, name, description, userId, userEmail } = await request.json();

    console.log(`NFT mint request for user: ${userId}, playlist: ${playlistId}`);

    // Validate environment variables
    if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY || 
        !process.env.HEDERA_TOKEN_ID || !process.env.HEDERA_SUPPLY_KEY) {
      throw new Error('Hedera environment variables are not set');
    }

    // Activate the user's Hedera account (if not already activated)
    console.log('Activating user account...');
    const activationResult = await activateHederaAccount(userId, 10);
    const recipientAccountId = activationResult.accountId;
    
    console.log(`Using recipient account: ${recipientAccountId}`);

    // Initialize Hedera client for NFT operations
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
    console.log('Uploading metadata to IPFS...');
    const metadataCid = await uploadToIPFS(metadata);
    const metadataUri = `ipfs://${metadataCid}`;
    console.log(`Metadata uploaded to IPFS: ${metadataUri}`);

    // Convert metadata URI to buffer
    const metadataBuffer = Buffer.from(metadataUri);

    // Mint the NFT using the existing token
    console.log('Minting NFT...');
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
    console.log(`NFT minted with serial number: ${serialNumber}`);

    // Transfer the NFT to the recipient account
    if (recipientAccountId) {
      const recipientId = AccountId.fromString(recipientAccountId);
      
      console.log(`Transferring NFT to: ${recipientAccountId}`);
      
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
      metadataUri: metadataUri,
      recipientAccountId: recipientAccountId,
      accountActivated: !activationResult.alreadyActivated
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