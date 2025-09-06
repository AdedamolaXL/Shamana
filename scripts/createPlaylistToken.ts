// scripts/createPlaylistToken.ts
var fs = require('fs');
var path = require('path');

// Load environment variables manually from .env.local
var envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line: string) => { // Added type annotation here
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      // Remove quotes if present
      const cleanValue = value.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      process.env[key.trim()] = cleanValue;
    }
  });
}

console.log('Environment variables loaded from .env.local:');
console.log('HEDERA_OPERATOR_ID:', process.env.HEDERA_OPERATOR_ID || 'Not set');
console.log('HEDERA_OPERATOR_KEY:', process.env.HEDERA_OPERATOR_KEY ? 'Set' : 'Not set');

var {
  Hbar,
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} = require("@hashgraph/sdk");

// Flexible private key parser
function parsePrivt(str: string) {
  try {
    return PrivateKey.fromStringDer(str);
  } catch {
    return PrivateKey.fromStringDer(str);
  }
}

async function createPlaylistToken() {
  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials are not set. Please check your .env.local file.');
  }

  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = parsePrivt(process.env.HEDERA_OPERATOR_KEY);
  
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(20));

  // Generate supply key
  const supplyKey = PrivateKey.generateECDSA();

  // Create the NFT token
  const nftCreate = new TokenCreateTransaction()
    .setTokenName("Playlist NFTs")
    .setTokenSymbol("PLST")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(10000) // Adjust as needed
    .setSupplyKey(supplyKey)
    .freezeWith(client);

  // Sign the transaction with the operator key
  const nftCreateTxSign = await nftCreate.sign(operatorKey);
  const nftCreateSubmit = await nftCreateTxSign.execute(client);
  const nftCreateRx = await nftCreateSubmit.getReceipt(client);

  // Get the token ID
  const tokenId = nftCreateRx.tokenId;

  if (!tokenId) {
    throw new Error('Failed to create NFT token');
  }

  console.log(`Created NFT token with ID: ${tokenId}`);
  console.log(`Supply key: ${supplyKey.toString()}`);
  console.log('\nAdd these to your environment variables:');
  console.log(`HEDERA_TOKEN_ID=${tokenId}`);
  console.log(`HEDERA_SUPPLY_KEY=${supplyKey.toString()}`);

  await client.close();
}

createPlaylistToken().catch(console.error);