# Shamana - Decentralized Music Streaming

## Primary Track - Social & Creator Economy

Shamana is a music streaming protocol that leverages decentralized technology (Hedera Hashgraph) to empower users with true ownership of their playlists and contributions. Users can create playlists, collaborate with others, and earn token rewards for their contributions.

## FEATURES

- User Authentication: Secure login via Supabase with Google OAuth

- Music Upload: Upload your own songs with metadata

- Playlist Creation: Create and manage playlists

- Collaborative Playlists: Multiple users can add songs to the same playlist

- Reputation System: Rate and critique playlists with transactions recorded on Hedera

- Token Rewards: Earn fungible tokens for contributing to playlists

- Playlist NFTs: Each playlist is minted as a non-fungible token (NFT) on Hedera

- Decentralized Identity: Users have Hedera DIDs for verifiable credentials

## Hedera Integration Summary

### Hedera Token Service (HTS)
Why HTS: We chose HTS for our dual-token economy because its native tokenization provides enterprise-grade security with predictable micro-transaction costs. The $0.0001 fixed token transfer fee enables sustainable micro-payments to African artists who typically earn pennies per stream, making blockchain-based royalties financially viable where Ethereum's volatile gas fees would be prohibitive.

#### Implementation:
- Fungible Token (MANA): Platform currency for artist payments and contributor rewards
- Non-Fungible Tokens (SHAM): Playlist ownership and collector editions

#### Transaction Types:
- TokenCreateTransaction - Initial MANA token and playlist NFT creation
- TokenMintTransaction - Reward distribution to artists and contributors
- TokenAssociateTransaction - User wallet setup during account creation
- TransferTransaction - MANA token transfers for royalty payments
- TokenBurnTransaction - Optional token burning for deflationary mechanics

Economic Justification: The predictable $0.0001 transfer fee allows us to distribute royalties as small as $0.01 without transaction costs consuming the payment. This enables sustainable micro-earnings for African artists who might receive hundreds of small payments monthly, making blockchain royalties economically feasible where traditional banking fees would be prohibitive.

### Hedera Consensus Service (HCS)
Why HCS: We implemented HCS for our reputation system because its immutable, timestamped message logging provides trustless verification of community interactions. The $0.0001 per message cost allows us to log every upvote/downvote without financial burden, creating a transparent reputation layer that would be cost-prohibitive on other networks.

#### Implementation:
- Playlist Reputation: Community voting system with immutable audit trail
- Contribution Tracking: Verifiable record of user contributions

#### Transaction Types:
-TopicCreateTransaction - New reputation topic for each playlist
- TopicMessageSubmitTransaction - Each vote and reputation event
- TopicInfoQuery - Retrieving reputation history and scores

Economic Justification: At $0.0001 per vote, we can process thousands of community interactions daily for less than $1, enabling robust social features without financial constraints. This ABFT-finalized consensus ensures reputation scores cannot be manipulated, building trust in community-curated content - essential for emerging music ecosystems where established rating systems are lacking.

### Hedera Decentralized Identity (DID)
Why Hedera DID: We selected Hedera DID for artist verification because its native integration with HTS/HCS creates a seamless identity-ownership-reputation trifecta. The predictable $0.0001 DID operation cost allows us to provide self-sovereign identity to every user, eliminating the identity verification costs that typically burden African creators.

#### Implementation:
- user Verification: Immutable user credentials
- Contribution Attribution: Verifiable song additions and playlist contributions

#### Transaction Types:
- DIDCreateTransaction - User identity creation during onboarding
- DIDUpdateTransaction - Profile and credential updates
- DIDResolve - Identity verification for royalty distribution

Economic Justification: The fixed $0.0001 DID creation cost enables us to onboard millions of African artists without identity infrastructure costs, overcoming a major barrier in markets where formal identity systems are limited. This creates a foundation for verifiable royalty claims and prevents Sybil attacks on our reward system.

### Transaction Economics & African Impact
Cost Predictability: Hedera's fixed $0.0001 fee structure enables financial modeling certainty essential for African markets where currency volatility already creates business challenges. We can guarantee platform costs regardless of network activity.

1. High Throughput: 10,000+ TPS capacity supports mass adoption across Africa's rapidly growing digital music markets, handling peak usage during music release seasons without congestion-related fee spikes.

2. Finality Speed: 3-5 second transaction finality enables near-instant royalty distributions and NFT collections, crucial for user experience in markets where delayed payments erode trust in digital platforms.

3. Sustainability: The energy-efficient proof-of-stake consensus aligns with Africa's growing focus on sustainable technology solutions, consuming minimal electricity compared to proof-of-work alternatives.

This economic model makes blockchain-based music monetization financially viable for African creators for the first time, transforming micro-earnings into sustainable income through Hedera's unique combination of low costs, high throughput, and enterprise-grade security.

## Tech Stack
- Frontend: Next.js 13, TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Database, Storage)
- Blockchain: Hedera Hashgraph (DID, HCS, HTS)
- Storage: IPFS (via Pinata) for NFT metadata

### Architecture Diagram



### Detailed Data Flow

### Deployed Hedera IDs
- HEDERA_NFT_TOKEN_ID=0.0.6917190
- HEDERA_FT_TOKEN_ID=0.0.6917191
- HEDERA_DID_TOPIC_ID=0.0.6768931
- HEDERA_VC_TOPIC_ID=0.0.6768933
- HEDERA_ADDRESS_BOOK_FILE_ID=0.0.6768934

## Prerequisites
Before running this application, ensure you have:

- Node.js (v18 or higher)
- A Supabase account and project (https://supabase.com)
- A Hedera testnet account (https://portal.hedera.com)
- A Pinata account for IPFS (https://pinata.cloud)

### Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/AdedamolaXL/Shamana.git
cd shamana
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables
Create a .env.local file in the root directory with the following variables:

Supabase
> NEXT_PUBLIC_SUPABASE_URL=

> NEXT_PUBLIC_SUPABASE_ANON_KEY=

Pinata
> PINATA_JWT=

> NEXT_PUBLIC_GATEWAY_URL=

Hedera
> HEDERA_OPERATOR_ID=

> HEDERA_OPERATOR_KEY=

> HEDERA_NFT_TOKEN_ID=

> HEDERA_FT_TOKEN_ID=

> HEDERA_SUPPLY_KEY=

> HEDERA_NETWORK=

> HEDERA_DID_TOPIC_ID=

> HEDERA_VC_TOPIC_ID=

> HEDERA_ADDRESS_BOOK_FILE_ID=

NextAuth

> NEXTAUTH_URL=

Encryption Key

> ENCRYPTION_KEY=

### 4. Hedera Setup
Run the provided scripts to set up the Hedera tokens and identity network:

#### Create tokens (non-fungible and fungible)
```bash
npm run create-token
```


#### Set up the identity network for reputation scores (HCS topics for DIDs and VCs)
```bash
npm run setup-identity
```


### 5. Run the Application
```bash
npm run dev
```
