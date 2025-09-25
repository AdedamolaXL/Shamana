// app/api/token/mint/route.ts
import { NextResponse } from "next/server";
import { mintFungible, activateAndGetRecipientAccount } from "@/lib/hedera-tokens";

export async function POST(req: Request) {
  try {
    const { userId, tokenId, amount } = await req.json();

    if (!userId || !tokenId || !amount) {
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

    const result = await mintFungible(tokenId, amount, recipientAccountId);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Token mint failed" },
      { status: 500 }
    );
  }
}
