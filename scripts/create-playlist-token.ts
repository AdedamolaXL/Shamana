import {
  initializeHederaClient,
  logEnvStatus,
} from './hedera-utils';

import {
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} from "@hashgraph/sdk";

async function createPlaylistToken() {
  let client;
  
  try {
    const { client: hederaClient, operatorId, operatorKey } = initializeHederaClient();
    client = hederaClient;
    
    logEnvStatus();

    // Generate supply key
    const supplyKey = PrivateKey.generateECDSA();

    // Create the NFT token
    const nftCreate = new TokenCreateTransaction()
      .setTokenName("Playlist NFTs")
      .setTokenSymbol("PLST")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(10000)
      .setSupplyKey(supplyKey)
      .freezeWith(client);

    // Sign the transaction with the operator key
    const nftCreateTxSign = await nftCreate.sign(operatorKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);

    // Get the token ID
    const tokenId = nftCreateRx.tokenId;

    if (!tokenId) {
      throw new Error('Failed to create NFT token');
    }

    console.log(`✅ Created NFT token with ID: ${tokenId}`);
    console.log(`🔑 Supply key: ${supplyKey.toString()}`);
    console.log('\n📋 Add these to your environment variables:');
    console.log(`HEDERA_TOKEN_ID=${tokenId}`);
    console.log(`HEDERA_SUPPLY_KEY=${supplyKey.toString()}`);

  } catch (error) {
    console.error('❌ Error creating playlist token:', error);
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {
        console.error('Error closing Hedera client:', e);
      }
    }
  }
}

createPlaylistToken();