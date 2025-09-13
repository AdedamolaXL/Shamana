const {
  initializeHederaClient,
  logEnvStatus,
} = require('./hedera-utils.js');

const {
    TopicCreateTransaction,
  FileCreateTransaction
} = require("@hashgraph/sdk");

async function setupIdentityNetwork() {
  let client;
  
  try {
    console.log("🚀 Setting up Hedera Identity Network...");
    
    const { client: hederaClient, operatorKey } = initializeHederaClient();
    client = hederaClient;
    
    logEnvStatus();

    // Create DID and VC topics
    const didTopicTx = await new TopicCreateTransaction()
      .setTopicMemo("DID Topic for Music App")
      .freezeWith(client);
    const didTopicTxSign = await didTopicTx.sign(operatorKey);
    const didTopicSubmit = await didTopicTxSign.execute(client);
    const didTopicReceipt = await didTopicSubmit.getReceipt(client);
    const didTopicId = didTopicReceipt.topicId;
    
    const vcTopicTx = await new TopicCreateTransaction()
      .setTopicMemo("VC Topic for Music App")
      .freezeWith(client);
    const vcTopicTxSign = await vcTopicTx.sign(operatorKey);
    const vcTopicSubmit = await vcTopicTxSign.execute(client);
    const vcTopicReceipt = await vcTopicSubmit.getReceipt(client);
    const vcTopicId = vcTopicReceipt.topicId;

    if (!didTopicId || !vcTopicId) {
      throw new Error('Failed to create topics');
    }

    console.log(`✅ Created DID Topic: ${didTopicId}`);
    console.log(`✅ Created VC Topic: ${vcTopicId}`);

    // Create address book
    const addressBook = {
      appnetName: "Music Streaming App",
      didTopicId: didTopicId.toString(),
      vcTopicId: vcTopicId.toString(),
      appnetDidServers: [process.env.NEXTAUTH_URL || "http://localhost:3000"]
    };

    const addressBookFileTx = await new FileCreateTransaction()
      .setContents(JSON.stringify(addressBook))
      .freezeWith(client);
    const addressBookFileTxSign = await addressBookFileTx.sign(operatorKey);
    const addressBookFileSubmit = await addressBookFileTxSign.execute(client);
    const addressBookFileReceipt = await addressBookFileSubmit.getReceipt(client);
    const addressBookFileId = addressBookFileReceipt.fileId;

    if (!addressBookFileId) {
      throw new Error('Failed to create address book file');
    }

    console.log(`✅ Created Address Book: ${addressBookFileId}`);

    // Store these IDs in environment variables or database
    console.log("\n📋 Add these to your environment variables:");
    console.log(`HEDERA_DID_TOPIC_ID=${didTopicId}`);
    console.log(`HEDERA_VC_TOPIC_ID=${vcTopicId}`);
    console.log(`HEDERA_ADDRESS_BOOK_FILE_ID=${addressBookFileId}`);

  } catch (error) {
    console.error("❌ Failed to set up identity network:", error);
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {
        console.error('Error closing Hedera client:', e);
      }
    }
  }
}

setupIdentityNetwork();