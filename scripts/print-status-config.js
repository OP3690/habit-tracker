const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const StatusConfig = require('../src/models/StatusConfig').default;

const DEMO_USER_ID = '68144435f74e9d8077904b14';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
}

async function main() {
  await connectToDatabase();
  const config = await StatusConfig.findOne({ userId: DEMO_USER_ID });
  console.log('StatusConfig for user', DEMO_USER_ID, ':', JSON.stringify(config, null, 2));
  await mongoose.disconnect();
}

main(); 