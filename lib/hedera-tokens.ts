import {
  Client,
  TokenMintTransaction,
  TransferTransaction,
  AccountId,
  TokenId,
  PrivateKey,
} from "@hashgraph/sdk";
import { initializeHederaClient } from "@/scripts/hedera-utils";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function initHedera() {
  const { client, operatorId, operatorKey } = initializeHederaClient();
  return { client, operatorId, operatorKey };
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

  try {
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
  .addTokenTransfer(TokenId.fromString(tokenId), operatorId.toString(), -amount)
  .addTokenTransfer(TokenId.fromString(tokenId), recipientAccountId, amount)
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
  } finally {
    await client.close();
  }
}

/**
 * Mint NFTs with metadata and transfer to recipient (auto-association enabled).
 */
export async function mintNft(
  tokenId: string,
  metadataArray: Buffer[],
  recipientUserId: string // UUID from Supabase
) {
  const { client, operatorId, operatorKey } = initHedera();

  try {
    console.log("🔧 Starting NFT mint process...");

    const supplyKeyString = process.env.HEDERA_SUPPLY_KEY;
    if (!supplyKeyString) {
      throw new Error("HEDERA_SUPPLY_KEY env var not set");
    }
    const supplyKey = PrivateKey.fromStringDer(supplyKeyString);

    const tokenIdObj = TokenId.fromString(tokenId);
    const operatorIdObj = AccountId.fromString(operatorId.toString());

    // --- MINT NFT ---
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenIdObj)
      .setMetadata(metadataArray)
      .freezeWith(client);

    const mintSigned = await (await mintTx.sign(operatorKey)).sign(supplyKey);
    const mintSubmit = await mintSigned.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);

    console.log("✅ Mint successful. Status:", mintReceipt.status.toString());

    let transferResult = null;

    if (mintReceipt.serials.length > 0) {
      const serialNumber = mintReceipt.serials[0].low;

      // --- LOOK UP recipient Hedera account from DB ---
      const supabase = createServerComponentClient({ cookies });
      const { data: user, error } = await supabase
        .from("users")
        .select("hedera_account_id")
        .eq("id", recipientUserId)
        .single();

      if (error) throw error;
      if (!user?.hedera_account_id) {
        throw new Error("Recipient has no Hedera account ID");
      }

      const recipientIdObj = AccountId.fromString(user.hedera_account_id);

      // --- TRANSFER ---
      const transferTx = new TransferTransaction()
        .addNftTransfer(tokenIdObj, serialNumber, operatorIdObj, recipientIdObj)
        .freezeWith(client);

      const transferSigned = await transferTx.sign(operatorKey); // only operator needed
      const transferSubmit = await transferSigned.execute(client);
      const transferReceipt = await transferSubmit.getReceipt(client);

      console.log("✅ NFT transfer status:", transferReceipt.status.toString());

      transferResult = {
        transactionId: transferSubmit.transactionId.toString(),
        status: transferReceipt.status.toString(),
        serialNumber,
      };
    }

    return {
      tokenId: tokenIdObj.toString(),
      serials: mintReceipt.serials.map((s) => s.toString()),
      mintStatus: mintReceipt.status.toString(),
      transactionId: mintSubmit.transactionId.toString(),
      transferResult,
    };
  } finally {
    await client.close();
  }
}
