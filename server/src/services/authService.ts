import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser, IUserPreferences } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_icod';

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<IUser> {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
}

export function verifyToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId).select('-password');
}

export interface ProfileUpdateFields {
  name?: string;
  photo?: string;
  location?: string;
  bio?: string;
  phone?: string;
  preferences?: IUserPreferences;
}

export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdateFields
): Promise<IUser | null> {
  // Filter out undefined values to avoid overwriting with undefined
  const filteredUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      filteredUpdates[key] = value;
    }
  }
  return User.findByIdAndUpdate(userId, filteredUpdates, { new: true }).select('-password');
}
