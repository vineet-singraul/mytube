import mongoose from 'mongoose';
import dns from 'dns';

// Kuch Windows/router DNS setups par mongodb+srv:// ka SRV lookup Node ke
// built-in resolver se fail ho jaata hai (ECONNREFUSED), chahe nslookup se
// wahi record theek se resolve ho jaaye. Google DNS par switch karne se ye
// tal jaata hai.
if (process.env.MONGODB_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/youtube_offline';
  await mongoose.connect(uri);
  console.log('MongoDB connected:', uri);
}
