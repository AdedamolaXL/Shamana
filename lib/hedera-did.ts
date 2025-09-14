import { createDID } from '@hiero-did-sdk/registrar';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { HcsTopicService } from '@hiero-did-sdk/hcs';
import { generateHederaKeys, encryptPrivateKey } from './hedera-keys';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize Hedera client service
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
      .select('hedera_did')
      .eq('id', userId)
      .single();

    if (existingUser?.hedera_did) {
      console.log('DID already exists for user:', userId);
      return {
        did: existingUser.hedera_did,
        success: true,
        alreadyExists: true
      };
    }

    // Generate Hedera keys
    const { privateKey, publicKey, evmAddress } = generateHederaKeys();
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Create DID using the new SDK
    const { did, didDocument } = await createDID({
      clientOptions: {
        network: 'testnet',
        accountId: process.env.HEDERA_OPERATOR_ID!,
        privateKey: process.env.HEDERA_OPERATOR_KEY!,
      },
    });

    console.log(`Created DID: ${did}`);

    // Store in database
    const { error } = await supabase
      .from('users')
      .update({
        hedera_did: did,
        hedera_public_key: publicKey.toStringDer(),
        hedera_private_key_encrypted: encryptedPrivateKey,
        hedera_evm_address: evmAddress,
        did_created_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to store DID: ${error.message}`);
    }

    return {
      did,
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

// export async function createHcsTopic(topicMemo: string) {
//   try {
//     const client = clientService.getClient('testnet');
//     const topicService = new HcsTopicService(client, { maxSize: 100 });

//     const topicId = await topicService.createTopic({
//       topicMemo,
//       waitForChangesVisibility: true,
//     });
    
//     console.log('Created HCS topic:', topicId);
//     return topicId;
//   } catch (error) {
//     console.error('Error creating HCS topic:', error);
//     throw error;
//   }
// }