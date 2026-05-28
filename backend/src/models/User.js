import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants/permissions.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    company: { type: String, default: '', trim: true, maxlength: 140 },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      validate: {
        validator(value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(value);
        },
        message: 'Password must contain uppercase, lowercase, and a number',
      },
    },
    role: { type: String, enum: ['super_admin', 'admin', 'editor', 'user'], default: 'user' },
    permissions: [{ type: String }],
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    sessionVersion: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('validate', function applyRolePermissions() {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = ROLE_DEFAULT_PERMISSIONS[this.role] || [];
  }
  if (this.role === 'super_admin') {
    this.permissions = ROLE_DEFAULT_PERMISSIONS.super_admin;
  }
});

userSchema.pre('save', async function save() {
  if (!this.isModified('password')) return;
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
