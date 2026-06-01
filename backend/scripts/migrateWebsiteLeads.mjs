import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lead } from '../src/models/Lead.js';
import { LqtLead } from '../src/models/LqtLead.js';

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required to run the website lead migration.');
}

await mongoose.connect(process.env.MONGODB_URI);
await Lead.syncIndexes();
await LqtLead.syncIndexes();
console.log('Website lead and LQT lead indexes synchronized.');
await mongoose.disconnect();
