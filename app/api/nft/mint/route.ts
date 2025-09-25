// app/api/nft/mint/route.ts
import { NextResponse } from "next/server";
import { mintNft, activateAndGetRecipientAccount } from "@/lib/hedera-tokens";

export async function POST(req: Request) {
  try {
    const { userId, tokenId, metadata } = await req.json();

    if (!userId || !tokenId || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure recipient account exists
    const recipientAccount = await activateAndGetRecipientAccount(userId);
    const recipientAccountId =
      typeof recipientAccount === "string"
        ? recipientAccount
        : recipientAccount.accountId;

    // Mint NFT(s) with metadata
    const metadataArray = [Buffer.from(metadata)];
    const result = await mintNft(tokenId, metadataArray, recipientAccountId);

    return NextResponse.json({
  success: true,
  ...result,
  metadataUri: metadata, 
});
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "NFT mint failed" },
      { status: 500 }
    );
  }
}
