import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

dotenv.config();

const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;
const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required.');
}

if (!email || !password) {
  throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required.');
}

if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password)) {
  throw new Error('SUPER_ADMIN_PASSWORD must contain uppercase, lowercase, and a number.');
}

await mongoose.connect(process.env.MONGODB_URI);

const existing = await User.findOne({ email });

if (existing) {
  existing.name = name;
  existing.role = 'super_admin';
  existing.password = password;
  await existing.save();
  console.log(`Updated super admin: ${email}`);
} else {
  await User.create({
    name,
    email,
    password,
    role: 'super_admin',
  });
  console.log(`Created super admin: ${email}`);
}

await mongoose.disconnect();
