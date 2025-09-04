// lib/hedera-account.ts
import {
  Client,
  Hbar,
  TransferTransaction,
  AccountId,
  PrivateKey
} from "@hashgraph/sdk";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function activateHederaAccount(userId: string, amount: number = 10) {
  console.log('activateHederaAccount called with userId:', userId);
  
  // Validate userId
  if (!userId || userId === 'undefined') {
    throw new Error('Invalid user ID provided');
  }

  // Initialize Supabase client
  const supabase = createServerComponentClient({ cookies });
  
  // Get user's Hedera keys
  const { data: user, error } = await supabase
    .from('users')
    .select('hedera_public_key, hedera_private_key_encrypted, hedera_evm_address')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    throw new Error('User not found or missing Hedera keys');
  }
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Rest of the function remains the same...
  // Initialize Hedera client
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY!);
  
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  
  try {
    // Create alias account ID from public key
    const aliasAccountId = AccountId.fromString(`0.0.${user.hedera_evm_address}`);
    
    // Transfer HBAR to activate the account
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount))
      .addHbarTransfer(aliasAccountId, new Hbar(amount))
      .freezeWith(client);
    
    const transferTxSign = await transferTx.sign(operatorKey);
    const transferSubmit = await transferTxSign.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    
    console.log(`Account activation transaction status: ${transferRx.status}`);
    
    // Update user record with the new account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        hedera_account_id: aliasAccountId.toString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Failed to update user with account ID:', updateError);
    }
    
    return {
      success: true,
      accountId: aliasAccountId.toString(),
      transactionId: transferSubmit.transactionId.toString()
    };
  } catch (error) {
    console.error('Failed to activate Hedera account:', error);
    throw error;
  } finally {
    await client.close();
  }
}