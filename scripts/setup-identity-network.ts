// scripts/setup-identity-network.ts

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
  Client,
  Hbar,
  PrivateKey,
  FileCreateTransaction,
  TopicCreateTransaction,
  TopicId
} = require("@hashgraph/sdk");

function parsePriv(str: string) {
  try {
    return PrivateKey.fromStringDer(str);
  } catch {
    return PrivateKey.fromStringDer(str);
  }
}

async function setupIdentityNetwork() {
  console.log("Setting up Hedera Identity Network...");

  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials are not set. Please check your .env.local file.');
  }

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = parsePriv(process.env.HEDERA_OPERATOR_KEY);
  
  client.setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(10));

  try {
    // Create DID and VC topics
    const didTopicTx = await new TopicCreateTransaction()
      .setTopicMemo("DID Topic for Music App")
      .execute(client);
    const didTopicReceipt = await didTopicTx.getReceipt(client);
    const didTopicId = didTopicReceipt.topicId;
    
    const vcTopicTx = await new TopicCreateTransaction()
      .setTopicMemo("VC Topic for Music App")
      .execute(client);
    const vcTopicReceipt = await vcTopicTx.getReceipt(client);
    const vcTopicId = vcTopicReceipt.topicId;

    console.log(`Created DID Topic: ${didTopicId}`);
    console.log(`Created VC Topic: ${vcTopicId}`);

    // Create address book
    const addressBook = {
      appnetName: "Music Streaming App",
      didTopicId: didTopicId.toString(),
      vcTopicId: vcTopicId.toString(),
      appnetDidServers: [process.env.NEXTAUTH_URL || "http://localhost:3000"]
    };

    const addressBookFileTx = await new FileCreateTransaction()
      .setContents(JSON.stringify(addressBook))
      .execute(client);
    const addressBookFileReceipt = await addressBookFileTx.getReceipt(client);
    const addressBookFileId = addressBookFileReceipt.fileId;

    console.log(`Created Address Book: ${addressBookFileId}`);

    // Store these IDs in environment variables or database
    console.log("\nAdd these to your environment variables:");
    console.log(`HEDERA_DID_TOPIC_ID=${didTopicId}`);
    console.log(`HEDERA_VC_TOPIC_ID=${vcTopicId}`);
    console.log(`HEDERA_ADDRESS_BOOK_FILE_ID=${addressBookFileId}`);

  } catch (error) {
    console.error("Failed to set up identity network:", error);
  }
}

setupIdentityNetwork();