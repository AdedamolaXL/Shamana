import {
  Client,
  TokenMintTransaction,
  TransferTransaction,
  AccountId,
  TokenId,
  PrivateKey,
  TokenInfoQuery,
  Hbar
} from "@hashgraph/sdk";
import { initializeHederaClient } from "@/scripts/hedera-utils";
import { activateHederaAccount } from "@/lib/hedera-account";

export function initHedera() {
  const { client, operatorId, operatorKey } = initializeHederaClient();
  return { client, operatorId, operatorKey };
}

/**
 * Ensures the user has an active Hedera account.
 */
export async function activateAndGetRecipientAccount(userId: string) {
  return await activateHederaAccount(userId);
}

/**
 * Mint fungible tokens and transfer to recipient.
 */
export async function mintFungible(
  tokenId: string,
  amount: number,
  recipientAccountId: string
) {
  const { client, operatorId, operatorKey } = initHedera();

  // Mint fungible tokens
  const mintTx = new TokenMintTransaction()
    .setTokenId(TokenId.fromString(tokenId))
    .setAmount(amount)
    .freezeWith(client);

  const mintSigned = await mintTx.sign(operatorKey);
  const mintSubmit = await mintSigned.execute(client);
  const mintReceipt = await mintSubmit.getReceipt(client);

  // Transfer to recipient
  const transferTx = new TransferTransaction()
    .addTokenTransfer(tokenId, operatorId, -amount)
    .addTokenTransfer(tokenId, recipientAccountId, amount)
    .freezeWith(client);

  const transferSigned = await transferTx.sign(operatorKey);
  const transferSubmit = await transferSigned.execute(client);
  const transferReceipt = await transferSubmit.getReceipt(client);

  return {
    amount,
    tokenId,
    recipientAccountId,
    transactionId: transferSubmit.transactionId.toString(),
    mintStatus: mintReceipt.status.toString(),
    transferStatus: transferReceipt.status.toString(),
  };
}

/**
 * Mint NFTs with metadata and optionally transfer to recipient.
 */
export async function mintNft(
  tokenId: string,
  metadataArray: Buffer[],
  recipientAccountId?: string
) {
  const { client, operatorId, operatorKey } = initHedera();

  try {
    console.log('🔧 Starting NFT mint process...');
    console.log('Operator:', operatorId.toString());
    console.log('Token ID:', tokenId);
    console.log('Recipient:', recipientAccountId || 'Using treasury');

    // Get the supply key from environment variables
    const supplyKeyString = process.env.HEDERA_SUPPLY_KEY;
    if (!supplyKeyString) {
      throw new Error('HEDERA_NFT_SUPPLY_KEY environment variable is required');
    }

    const supplyKey = PrivateKey.fromStringDer(supplyKeyString);
    console.log('✅ Supply key loaded');

    // Verify the token exists
    const tokenInfo = await new TokenInfoQuery()
      .setTokenId(TokenId.fromString(tokenId))
      .execute(client);
    
    console.log('✅ Token verified:', {
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      treasury: tokenInfo.treasuryAccountId?.toString()
    });

    // Create mint transaction - sign with BOTH operator key AND supply key
    const mintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setMetadata(metadataArray)
      .freezeWith(client);

    // Sign with both operator key (as payer) and supply key (as minter)
    const mintSigned = await (await mintTx.sign(operatorKey)).sign(supplyKey);
    const mintSubmit = await mintSigned.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);

    console.log('✅ Mint successful. Status:', mintReceipt.status.toString());
    console.log('Serial numbers:', mintReceipt.serials.map(s => s.toString()));

    // Transfer to recipient if specified
    if (recipientAccountId && mintReceipt.serials.length > 0) {
      console.log('🔄 Transferring NFT to recipient...');

    for (const s of mintReceipt.serials) {
      const serial = s.toNumber();
      
      const transferTx = await new TransferTransaction()
      .addNftTransfer(
      tokenId, // ensure proper type
      serial,
      operatorId.toString(),
      AccountId.fromString(recipientAccountId)
    )
    .freezeWith(client)
        .sign(operatorKey);
      
       const transferSubmit = await transferTx.execute(client);
      const transferReceipt = await transferSubmit.getReceipt(client);
      
      console.log('✅ Transfer successful. Status:', transferReceipt.status.toString());
    }

    }
      
   

     

    return {
      tokenId,
      serials: mintReceipt.serials.map((s) => s.toString()),
      mintStatus: mintReceipt.status.toString(),
      transactionId: mintSubmit.transactionId.toString(),
    };
  } catch (error) {
    console.error('❌ NFT minting failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}
