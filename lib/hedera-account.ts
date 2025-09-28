import {
  Client,
  Hbar,
  TransferTransaction,
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
} from "@hashgraph/sdk";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Activate or retrieve a Hedera account for a user.
 * - If user already has a valid account, return it.
 * - If not, creates a new account with unlimited auto-association and stores keys.
 * - If creation fails, falls back to alias/EVM activation.
 */
export async function activateHederaAccount(userId: string, amount: number = 1) {
  console.log("activateHederaAccount called with userId:", userId);

  if (!userId || userId === "undefined") {
    throw new Error("Invalid user ID provided");
  }

  const supabase = createServerComponentClient({ cookies });
  const { data: user, error } = await supabase
    .from("users")
    .select(
      "hedera_public_key, hedera_private_key_encrypted, hedera_account_id, hedera_evm_address"
    )
    .eq("id", userId)
    .single();

  if (error || !user) {
    throw new Error("User not found or missing Hedera keys");
  }

  // --- CASE 1: Already has an account ---
  if (user.hedera_account_id && isValidHederaAccountId(user.hedera_account_id)) {
    console.log(`Account already activated: ${user.hedera_account_id}`);
    return {
      success: true,
      accountId: user.hedera_account_id,
      alreadyActivated: true,
    };
  }

  // --- CASE 2: Create new account with auto-association ---
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY!);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  try {
    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;

    const accountCreateTx = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(amount))
      .setMaxAutomaticTokenAssociations(-1) // 🔑 Unlimited auto-associations
      .freezeWith(client);

    const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
    const accountCreateSubmit = await accountCreateTxSign.execute(client);
    const accountCreateRx = await accountCreateSubmit.getReceipt(client);
    const newAccountId = accountCreateRx.accountId;

    if (!newAccountId) throw new Error("No account ID returned from create");

    console.log(`✅ New Hedera account created: ${newAccountId.toString()}`);

    const encryptedPrivateKey = encryptPrivateKey(newPrivateKey);

    await supabase
      .from("users")
      .update({
        hedera_account_id: newAccountId.toString(),
        hedera_public_key: newPublicKey.toStringDer(),
        hedera_private_key_encrypted: encryptedPrivateKey,
        hedera_evm_address: newPublicKey.toEvmAddress(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return {
      success: true,
      accountId: newAccountId.toString(),
      alreadyActivated: false,
    };
  } catch (err) {
    console.error("Account creation failed, trying fallback:", err);
    return await fallbackAccountActivation(
      userId,
      amount,
      supabase,
      client,
      operatorId,
      operatorKey
    );
  } finally {
    await client.close();
  }
}

/**
 * Validate Hedera account ID format (0.0.xxxx).
 */
function isValidHederaAccountId(accountId: string): boolean {
  return /^0\.0\.\d+$/.test(accountId);
}

/**
 * Fallback method: activate account using EVM alias.
 */
async function fallbackAccountActivation(
  userId: string,
  amount: number,
  supabase: any,
  client: Client,
  operatorId: AccountId,
  operatorKey: PrivateKey
) {
  console.log("Trying fallback account activation method...");

  try {
    const { data: user } = await supabase
      .from("users")
      .select("hedera_evm_address")
      .eq("id", userId)
      .single();

    if (!user?.hedera_evm_address) {
      throw new Error("User does not have Hedera EVM address");
    }

    const aliasAccountId = AccountId.fromEvmAddress(
      0,
      0,
      user.hedera_evm_address
    );

    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount))
      .addHbarTransfer(aliasAccountId, new Hbar(amount))
      .freezeWith(client);

    const transferTxSign = await transferTx.sign(operatorKey);
    const transferSubmit = await transferTxSign.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    console.log(`Fallback activation status: ${transferRx.status}`);

    await supabase
      .from("users")
      .update({
        hedera_account_id: aliasAccountId.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return {
      success: true,
      accountId: aliasAccountId.toString(),
      transactionId: transferSubmit.transactionId.toString(),
      alreadyActivated: false,
    };
  } catch (fallbackError) {
    console.error("Fallback activation also failed:", fallbackError);
    throw fallbackError;
  }
}

/**
 * Simple key encode/decode.
 * ⚠️ Use secure encryption in production!
 */
function encryptPrivateKey(privateKey: PrivateKey): string {
  return Buffer.from(privateKey.toStringDer()).toString("base64");
}
function decryptPrivateKey(encryptedKey: string): PrivateKey {
  const keyDer = Buffer.from(encryptedKey, "base64").toString("utf8");
  return PrivateKey.fromStringDer(keyDer);
}
