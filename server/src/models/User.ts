import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences {
  notifications?: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  photo?: string;
  location?: string;
  bio?: string;
  phone?: string;
  preferences?: IUserPreferences;
  role: 'user' | 'admin';
  streakDays: number;
  lastActiveDate?: Date;
  badges: string[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    photo: { type: String },
    location: { type: String, trim: true },
    bio: { type: String, maxlength: 500, trim: true },
    phone: { type: String, trim: true },
    preferences: { type: userPreferencesSchema, default: () => ({}) },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    badges: [{ type: String }],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, index: true },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String, index: true },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
