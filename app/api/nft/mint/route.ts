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

// Flexible private key parser from your example
function parsePriv(str: string) {
  try {
    return PrivateKey.fromStringDer(str);
  } catch {
    return PrivateKey.fromStringDer(str);
  }
}

// Account activation function - only transfers HBAR to existing alias
async function activateHederaAccount(userId: string, amount: number = 10) {
  // Initialize Supabase client
  const supabase = createServerComponentClient({ cookies });
  
  // Get user's existing Hedera keys (should already exist from signup)
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('hedera_public_key, hedera_private_key_encrypted, hedera_evm_address, hedera_account_id')
    .eq('id', userId)
    .single();
  
  if (fetchError || !user) {
    throw new Error('User not found in database');
  }
  
  if (!user.hedera_evm_address) {
    throw new Error('User does not have Hedera EVM address');
  }
  
  // If account is already activated, return the existing account ID
  if (user.hedera_account_id) {
    console.log(`Account already activated: ${user.hedera_account_id}`);
    return {
      success: true,
      accountId: user.hedera_account_id,
      alreadyActivated: true
    };
  }
  
  // Initialize Hedera client
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = parsePriv(process.env.HEDERA_OPERATOR_KEY!);
  
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  
  try {
    // Create alias account ID from the existing EVM address
    const aliasAccountId = AccountId.fromString(`0.0.${user.hedera_evm_address}`);
    
    console.log(`Activating account for EVM address: ${user.hedera_evm_address}`);
    console.log(`Alias account ID: ${aliasAccountId.toString()}`);
    
    // Transfer HBAR to activate the account
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount))
      .addHbarTransfer(aliasAccountId, new Hbar(amount))
      .freezeWith(client);
    
    const transferTxSign = await transferTx.sign(operatorKey);
    const transferSubmit = await transferTxSign.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    
    console.log(`Account activation transaction status: ${transferRx.status}`);
    
    // Update user record with the activated account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        hedera_account_id: aliasAccountId.toString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Failed to update user with account ID:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    
    console.log(`Account successfully activated: ${aliasAccountId.toString()}`);
    
    return {
      success: true,
      accountId: aliasAccountId.toString(),
      transactionId: transferSubmit.transactionId.toString(),
      alreadyActivated: false
    };
  } catch (error) {
    console.error('Failed to activate Hedera account:', error);
    throw error;
  } finally {
    await client.close();
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