import { createDID } from '@hiero-did-sdk/registrar';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { HcsTopicService } from '@hiero-did-sdk/hcs';
import { generateHederaKeys, encryptPrivateKey } from './hedera-keys';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { activateHederaAccount } from './hedera-account';

const hederaConfig: HederaClientConfiguration = {
  networks: [
    {
      network: 'testnet',
      operatorId: process.env.HEDERA_OPERATOR_ID!,
      operatorKey: process.env.HEDERA_OPERATOR_KEY!,
    },
  ],
};

const clientService = new HederaClientService(hederaConfig);

export async function createUserDid(userId: string, userEmail: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Double-check if DID already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('hedera_did, hedera_account_id')
      .eq('id', userId)
      .single();

    if (existingUser?.hedera_did && existingUser?.hedera_account_id) {
      console.log('DID and account already exist for user:', userId);
      return {
        did: existingUser.hedera_did,
        accountId: existingUser.hedera_account_id,
        success: true,
        alreadyExists: true
      };
    }

    // First, activate the Hedera account to get a proper account ID
    console.log('Activating Hedera account for user:', userId);
    const accountResult = await activateHederaAccount(userId, 10); // 5 HBAR initial balance
    
    if (!accountResult.success) {
      throw new Error('Failed to activate Hedera account');
    }

    // Generate Hedera keys for DID
    const { privateKey, publicKey, evmAddress } = generateHederaKeys();
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Create DID using the proper account ID
    const { did, didDocument } = await createDID({
      clientOptions: {
        network: 'testnet',
        accountId: process.env.HEDERA_OPERATOR_ID!,// Use the properly created account ID
        privateKey: process.env.HEDERA_OPERATOR_KEY!,
      },
    });

    console.log(`Created DID: ${did} for account: ${accountResult.accountId}`);

    // Store in database
    const { error } = await supabase
      .from('users')
      .update({
        hedera_did: did,
        hedera_public_key: publicKey.toStringDer(),
        hedera_private_key_encrypted: encryptedPrivateKey,
        hedera_evm_address: evmAddress,
        hedera_account_id: accountResult.accountId, // Store the proper account ID
        did_created_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to store DID: ${error.message}`);
    }

    return {
      did,
      accountId: accountResult.accountId,
      privateKey: encryptedPrivateKey,
      publicKey: publicKey.toStringDer(),
      evmAddress,
      success: true,
      alreadyExists: false
    };

  } catch (error) {
    console.error("Failed to create decentralized DID:", error);
    throw error;
  }
}