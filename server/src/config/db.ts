import mongoose from 'mongoose';

const isDev = process.env.NODE_ENV !== 'production';
mongoose.set('autoIndex', isDev);

export async function connectMongo(uri: string): Promise<typeof mongoose> {
  if (!uri) throw new Error('MONGO_URI is not set');
  return mongoose.connect(uri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}


