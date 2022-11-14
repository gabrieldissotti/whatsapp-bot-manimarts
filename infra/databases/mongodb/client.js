const mongoose = require('mongoose');

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };

  cached = global.mongoose;
}

async function getConnection() {
  if (cached.conn) {
    console.log('MONGODB: getting connection from cache');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseConnection) => mongooseConnection);
  }

  try {
    console.log('MONGODB: starting new connection');
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// start before first request
getConnection();

module.exports.getConnection = getConnection;
