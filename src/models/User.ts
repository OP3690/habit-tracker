import mongoose, { Document, Schema } from 'mongoose';
import { hash } from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  createdAt: Date;
  updatedAt: Date;
  categories: string[];
  priorities: string[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
    trim: true,
  },
  categories: {
    type: [String],
    default: ['work', 'personal', 'health', 'learning'],
  },
  priorities: {
    type: [String],
    default: ['high', 'medium', 'low'],
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Ensure model is not redefined
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 