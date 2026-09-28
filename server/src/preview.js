import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Preview mode: runs the whole API against a temporary in-memory MongoDB.
 * Data resets when the process stops — perfect for demos & screenshots.
 * Usage: npm run preview (workspace server)
 */
async function main() {
  console.log('🧪 PREVIEW MODE — starting in-memory MongoDB...');
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri('planmyplate');
  console.log(`🧪 In-memory MongoDB ready at ${process.env.MONGO_URI}`);

  const { seed } = await import('./seed/seed.js');
  await seed({ exit: false });

  console.log('🧪 Starting API server...\n');
  await import('./index.js');
}

main().catch((err) => {
  console.error('❌ Preview failed:', err.message);
  process.exit(1);
});
