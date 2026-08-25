const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const DEFAULT_URI = "mongodb+srv://javeriasher90_db_user:UAFForm%402026Secure@ugformcluster.qslkbuw.mongodb.net/UGFormDB?retryWrites=true&w=majority";
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.STORAGE_URL || DEFAULT_URI;
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("MongoDB Connected Successfully");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;