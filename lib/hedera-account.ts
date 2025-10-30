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


function initializeHederaClientDirect() {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error('Hedera operator credentials not configured');
  }

  const client = Client.forTestnet();
  const operatorIdObj = AccountId.fromString(operatorId);
  const operatorKeyObj = PrivateKey.fromStringDer(operatorKey);
  
  client.setOperator(operatorIdObj, operatorKeyObj);

  return {
    client,
    operatorId: operatorIdObj, 
    operatorKey: operatorKeyObj 
  };
}

/**
 * Activate or retrieve a Hedera account for a user.
 * - If user already has a valid account, return it.
 * - If not, creates a new account with unlimited auto-association and stores keys.
 * - If creation fails, falls back to alias/EVM activation.
 */
export async function activateHederaAccount(userId: string, amount: number = 1) {
  console.log("🔄 activateHederaAccount called with userId:", userId);

  if (!userId || userId === "undefined") {
    throw new Error("Invalid user ID provided");
  }

  const supabase = createServerComponentClient({ cookies });

  // Create new account
  const { client, operatorId, operatorKey } = initializeHederaClientDirect();

  try {
    console.log("🔑 Generating new Hedera keys...");
    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;

    console.log("🔍 Raw Private Key:", newPrivateKey.toStringRaw());
    console.log("🔍 Raw Public Key:", newPublicKey.toStringRaw());

    const accountCreateTx = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(amount))
      .setMaxAutomaticTokenAssociations(-1)
      .freezeWith(client);

    const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
    const accountCreateSubmit = await accountCreateTxSign.execute(client);
    const accountCreateRx = await accountCreateSubmit.getReceipt(client);
    
    const newAccountId = accountCreateRx.accountId;

    if (!newAccountId) throw new Error("No account ID returned from create");

    console.log(`✅ New Hedera account created: ${newAccountId.toString()}`);
    
    const encryptedPrivateKey = encryptPrivateKeyProperly(newPrivateKey);

    // Store in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        hedera_account_id: newAccountId.toString(), // Store the ACTUAL account ID
        hedera_public_key: newPublicKey.toStringDer(),
        hedera_private_key_encrypted: encryptedPrivateKey,
        hedera_evm_address: newPublicKey.toEvmAddress(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // Verify storage worked
if (!updateError) {
  const { data: verifyData } = await supabase
    .from('users')
    .select('hedera_private_key_encrypted')
    .eq('id', userId)
    .single();
  
  if (verifyData) {

    const storedDer = verifyData.hedera_private_key_encrypted;
    console.log("🔐 Storage verification - Stored DER:", storedDer);
    console.log("🔐 Storage verification - Matches original:", storedDer === newPrivateKey.toStringDer());
  }
}
    
    return {
      success: true,
      accountId: newAccountId.toString(), 
      alreadyActivated: false,
    };
  } catch (err) {
    console.error("❌ Account creation failed:", err);
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
 */
function encryptPrivateKeyProperly(privateKey: PrivateKey): string {
  // Use the DER format consistently
  const privateKeyDer = privateKey.toStringDer();
  console.log("🔑 Private Key DER:", privateKeyDer);

  return privateKeyDer;
}

export function decryptPrivateKeyProperly(encryptedKey: string): PrivateKey {
  try {
    // Convert from base64 back to DER string
    const privateKeyDer = Buffer.from(encryptedKey, 'base64').toString('utf8');
    console.log("🔑 Decrypted DER:", privateKeyDer);
    
    // Parse the DER string back to PrivateKey object
    return PrivateKey.fromStringDer(privateKeyDer);
  } catch (error) {
    console.error("❌ Error decrypting private key:", error);
    throw new Error("Failed to decrypt private key");
  }
}

export function decryptPrivateKey(encryptedKey: string): PrivateKey {
  console.log("🔑 Raw DER from database:", encryptedKey);
  return PrivateKey.fromStringDer(encryptedKey);
}