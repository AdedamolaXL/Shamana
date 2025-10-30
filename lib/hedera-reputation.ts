import { HcsMessageService } from '@hiero-did-sdk/hcs';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { PrivateKey } from '@hashgraph/sdk';
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
const client = clientService.getClient('testnet');
const hcsMessageService = new HcsMessageService(client, { maxSize: 100 });

export interface ReputationVote {
  type: 'upvote' | 'downvote';
  playlistId: string;
  voterId: string;
  voterDID: string;
  timestamp: number;
  weight?: number;
}

export interface ReputationCritique {
  type: 'critique';
  playlistId: string;
  criticId: string;
  criticDID: string;
  comment: string;
  timestamp: number;
  rating?: number;
}

export type ReputationMessage = ReputationVote | ReputationCritique;

export class ReputationSystem {
  private vcTopicId: string;

  constructor() {
    this.vcTopicId = process.env.HEDERA_VC_TOPIC_ID!;
    if (!this.vcTopicId) {
      throw new Error('HEDERA_VC_TOPIC_ID environment variable is required');
    }
  }

   /**
   * Submit a reputation message to the HCS topic
   */
  async submitReputationMessage(message: ReputationMessage): Promise<string> {
    try {
      const messageString = JSON.stringify(message);
      
      const result = await hcsMessageService.submitMessage({
        topicId: this.vcTopicId,
        message: messageString,
        submitKey: PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY!),
        waitForChangesVisibility: true,
      });

      console.log('Reputation message submitted successfully:');
      console.log('Transaction ID:', result.transactionId);
      
      return result.transactionId.toString();
    } catch (error) {
      console.error('Error submitting reputation message:', error);
      throw new Error('Failed to submit reputation message');
    }
  }
  /**
   * Retrieve reputation messages for a specific playlist
   */
  async getPlaylistReputation(playlistId: string, limit: number = 100): Promise<ReputationMessage[]> {
    try {
      const messages = await hcsMessageService.getTopicMessages({
        topicId: this.vcTopicId,
        limit,
        maxWaitSeconds: 10,
      });

      const reputationMessages: ReputationMessage[] = [];

      for (const msg of messages) {
        try {
          const content = Buffer.from(msg.contents).toString('utf-8');
          const parsedMessage = JSON.parse(content) as ReputationMessage;
          
          // Filter messages for the specific playlist
          if (parsedMessage.playlistId === playlistId) {
            reputationMessages.push(parsedMessage);
          }
        } catch (e) {
          // Skip non-JSON messages or invalid reputation messages
          console.warn('Skipping invalid reputation message:', e);
        }
      }

      return reputationMessages;
    } catch (error) {
      console.error('Error retrieving reputation messages:', error);
      throw new Error('Failed to retrieve reputation messages');
    }
  }

  /**
   * Calculate reputation score for a playlist
   */
  async calculatePlaylistReputation(playlistId: string): Promise<{
    score: number;
    upvotes: number;
    downvotes: number;
    critiques: number;
    totalVotes: number;
  }> {
    const messages = await this.getPlaylistReputation(playlistId);
    
    let upvotes = 0;
    let downvotes = 0;
    let critiques = 0;

    messages.forEach(message => {
      if (message.type === 'upvote') {
        upvotes++;
      } else if (message.type === 'downvote') {
        downvotes++;
      } else if (message.type === 'critique') {
        critiques++;
      }
    });

    const score = (upvotes * 10) - (downvotes * 10);
    const totalVotes = upvotes + downvotes;

    return {
      score,
      upvotes,
      downvotes,
      critiques,
      totalVotes
    };
  }

  /**
   * Get user's DID from database
   */
  public async getUserDID(userId: string): Promise<string> {
    try {
      const supabase = createServerComponentClient({ cookies });
      
      const { data: user, error } = await supabase
        .from('users')
        .select('hedera_did')
        .eq('id', userId)
        .single();

      if (error || !user?.hedera_did) {
        // Fallback to a default DID format if not found in database
        return `did:hedera:testnet:${userId}_0.0.${Math.floor(Math.random() * 1000000)}`;
      }

      return user.hedera_did;
    } catch (error) {
      console.error('Error fetching user DID:', error);
      return `did:hedera:testnet:${userId}_0.0.${Math.floor(Math.random() * 1000000)}`;
    }
  }

}

// Singleton instance
export const reputationSystem = new ReputationSystem();