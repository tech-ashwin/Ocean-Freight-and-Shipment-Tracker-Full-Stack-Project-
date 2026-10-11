import 'dotenv/config';
import { connectMongo, isMongoActive } from '../mongodb.js';
import { db } from '../db.js';

async function main() {
  console.log('--- BluSpark Freight Ops: MongoDB Migration Utility ---');
  console.log(`Connecting to MongoDB at: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bluspark_logistics'}`);

  const connected = await connectMongo();
  if (!connected) {
    console.error('Migration Aborted: Could not establish connection to MongoDB.');
    console.error('Please verify your MONGODB_URI in your .env file or environment variables.');
    process.exit(1);
  }

  console.log('MongoDB connected successfully. Beginning migration from JSON data store...');
  const result = await db.migrateJsonToMongo();

  if (result.success) {
    console.log('SUCCESS:', result.message);
    console.log('Document counts in MongoDB:', result.counts);
    process.exit(0);
  } else {
    console.error('Migration Failed:', result.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error during migration:', err);
  process.exit(1);
});
