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

>NEXT_PUBLIC_GATEWAY_URL=

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

# Create the NFT and FT tokens
```bash
npm run create-token
```


# Set up the identity network (HCS topics for DIDs and VCs)
```bash
npm run setup-identity
```


### 5. Run the Application
```bash
npm run dev
```
