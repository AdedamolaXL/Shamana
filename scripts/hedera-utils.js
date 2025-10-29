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

// Gets operator account ID and key
function getOperator() {
  if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials are not set. Please check your .env.local file.');
  }

  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = parsePrivateKey(process.env.HEDERA_OPERATOR_KEY);
  
  return { operatorId, operatorKey };
}

// Initializes Hedera client
export function initializeHederaClient() {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error('Hedera operator credentials not configured');
  }

  const client = Client.forTestnet();
  
  // Converts to AccountId and PrivateKey objects
  const operatorIdObj = AccountId.fromString(operatorId);
  const operatorKeyObj = PrivateKey.fromStringDer(operatorKey);
  
  client.setOperator(operatorIdObj, operatorKeyObj);

  return {
    client,
    operatorId: operatorIdObj, 
    operatorKey: operatorKeyObj 
  };
}

// Validates environment variables
function validateEnvVars(requiredVars) {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Logs environment variable status
function logEnvStatus() {
  console.log('Environment variables status:');
  console.log('HEDERA_OPERATOR_ID:', process.env.HEDERA_OPERATOR_ID || 'Not set');
  console.log('HEDERA_OPERATOR_KEY:', process.env.HEDERA_OPERATOR_KEY ? 'Set' : 'Not set');
  console.log('HEDERA_TOKEN_ID:', process.env.HEDERA_TOKEN_ID || 'Not set');
  console.log('HEDERA_SUPPLY_KEY:', process.env.HEDERA_SUPPLY_KEY ? 'Set' : 'Not set');
  console.log('---');
}

// Exports all functions
module.exports = {
  loadEnvVariables,
  parsePrivateKey,
  getOperator,
  initializeHederaClient,
  validateEnvVars,
  logEnvStatus
};