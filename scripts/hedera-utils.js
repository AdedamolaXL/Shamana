const path = require('path');
const fs = require('fs');
const {
  PrivateKey,
  AccountId,
  Client,
  Hbar
} = require("@hashgraph/sdk");

// Load environment variables from .env.local
function loadEnvVariables() {
  // Use __dirname instead of import.meta.url for CommonJS
  const envPath = path.resolve(__dirname, '../.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const [key, ...value] = line.split('=');
      if (key && value.length > 0) {
        const cleanValue = value.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        process.env[key.trim()] = cleanValue;
      }
    });
  }
}

// Flexible private key parser
function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringDer(str);
  } catch {
    return PrivateKey.fromStringDer(str);
  }
}

// Get operator account ID and key
function getOperator() {
  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials are not set. Please check your .env.local file.');
  }

  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = parsePrivateKey(process.env.HEDERA_OPERATOR_KEY);
  
  return { operatorId, operatorKey };
}

// Initialize Hedera client
function initializeHederaClient() {
  loadEnvVariables();
  
  const { operatorId, operatorKey } = getOperator();
  
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(20));
  
  return { client, operatorId, operatorKey };
}

// Validate environment variables
function validateEnvVars(requiredVars) {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Log environment variable status
function logEnvStatus() {
  console.log('Environment variables status:');
  console.log('HEDERA_OPERATOR_ID:', process.env.HEDERA_OPERATOR_ID || 'Not set');
  console.log('HEDERA_OPERATOR_KEY:', process.env.HEDERA_OPERATOR_KEY ? 'Set' : 'Not set');
  console.log('HEDERA_TOKEN_ID:', process.env.HEDERA_TOKEN_ID || 'Not set');
  console.log('HEDERA_SUPPLY_KEY:', process.env.HEDERA_SUPPLY_KEY ? 'Set' : 'Not set');
  console.log('---');
}

// Export all functions
module.exports = {
  loadEnvVariables,
  parsePrivateKey,
  getOperator,
  initializeHederaClient,
  validateEnvVars,
  logEnvStatus
};