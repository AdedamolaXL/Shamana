# Shamana - Decentralized Music Streaming

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

## Hedera Integration
- Each user gets a Hedera DID (Decentralized Identifier) upon sign-up
- Playlist creation mints an NFT on Hedera
- Users earn fungible tokens for contributing songs to playlists
- Reputation system (upvotes, downvotes, critiques) is recorded on Hedera Consensus Service (HCS)

## Tech Stack
- Frontend: Next.js 13, TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Database, Storage)
- Blockchain: Hedera Hashgraph (DID, HCS, HTS)
- Storage: IPFS (via Pinata) for NFT metadata

### Prerequisites
Before running this application, ensure you have:

- Node.js (v18 or higher)
- A Supabase account and project (https://supabase.com)
- A Hedera testnet account (https://portal.hedera.com)
- A Pinata account for IPFS (https://pinata.cloud)

## Setup Instructions

### 1. Clone the repository

git clone <repository-url>
cd shamana

### 2. Install dependencies

npm install

### 3. Environment Variables
Create a .env.local file in the root directory with the following variables:

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hedera
HEDERA_OPERATOR_ID=your_hedera_operator_id
HEDERA_OPERATOR_KEY=your_hedera_operator_private_key
HEDERA_NFT_TOKEN_ID=your_hedera_nft_token_id
HEDERA_FT_TOKEN_ID=your_hedera_ft_token_id
HEDERA_NFT_SUPPLY_KEY=your_hedera_nft_supply_key
HEDERA_DID_TOPIC_ID=your_hedera_did_topic_id
HEDERA_VC_TOPIC_ID=your_hedera_vc_topic_id
HEDERA_ADDRESS_BOOK_FILE_ID=your_hedera_address_book_file_id

# Pinata (IPFS)
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Encryption key for private keys (change this in production)
ENCRYPTION_KEY=your_encryption_key

# Next Auth (optional)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

### 4. Hedera Setup
Run the provided scripts to set up the Hedera tokens and identity network:

# Create the NFT and FT tokens
npm run create-token

# Set up the identity network (HCS topics for DIDs and VCs)
npm run setup-identity

### 5. Run the Application

npm run dev