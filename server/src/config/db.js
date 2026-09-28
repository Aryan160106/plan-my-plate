import mongoose from 'mongoose';

/**
 * Connect to MongoDB. Tries the configured MONGO_URI and gives a friendly
 * message if the local database is not running.
 */
export default async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/planmyplate';

  // Already connected (e.g. preview mode connected first) — reuse it
  if (mongoose.connection.readyState === 1) {
    console.log(`✅ Reusing existing MongoDB connection (${mongoose.connection.name})`);
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('\n❌ MongoDB connection failed:', err.message);
    console.error('   • Make sure MongoDB is running locally (mongod), or');
    console.error('   • Or put a MongoDB Atlas connection string in server/.env as MONGO_URI\n');
    throw err;
  }

  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
}
