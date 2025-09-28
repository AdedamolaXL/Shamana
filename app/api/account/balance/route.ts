import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AccountBalanceQuery, Client, TokenId, AccountId } from "@hashgraph/sdk";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Hedera account ID from database
    const { data: user } = await supabase
      .from('users')
      .select('hedera_account_id')
      .eq('id', session.user.id)
      .single();

    if (!user?.hedera_account_id) {
      return NextResponse.json({ balance: 0, error: "No Hedera account found" });
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const tokenId = process.env.HEDERA_FT_TOKEN_ID;

    if (!operatorId || !operatorKey || !tokenId) {
      return NextResponse.json({ error: "Hedera configuration missing" }, { status: 500 });
    }

    client.setOperator(operatorId, operatorKey);

    // Query token balance
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(user.hedera_account_id);

    const balance = await balanceQuery.execute(client);
    
    // Get specific token balance
    const tokenBalance = balance.tokens?.get(TokenId.fromString(tokenId)) || 0;

    await client.close();

    return NextResponse.json({ 
      balance: tokenBalance,
      accountId: user.hedera_account_id
    });

  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}