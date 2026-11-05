import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as authService from '../services/authService';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import User from '../models/User';
import Person from '../models/Person';
import Action from '../models/Action';
import ActivityLog from '../models/ActivityLog';
import Initiative from '../models/Initiative';
import Organization from '../models/Organization';
import Note from '../models/Note';
import Reminder from '../models/Reminder';
import Suggestion from '../models/Suggestion';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await authService.createUser(name, email, password);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();
    
    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error('[AUTH] Failed to send verification email:', err);
    });
    
    const { token } = await authService.loginUser(email, password);

    res.status(201).json({
      success: true,
      data: { 
        user: { 
          ...user.toObject(), 
          password: undefined,
          isEmailVerified: user.isEmailVerified 
        }, 
        token 
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const { user, token } = await authService.loginUser(email, password);

    res.json({
      success: true,
      data: { 
        user: { 
          ...user.toObject(), 
          password: undefined,
          isEmailVerified: user.isEmailVerified 
        }, 
        token 
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { name, photo, location, bio, phone, preferences } = req.body;

    const user = await authService.updateUserProfile(userId, { name, photo, location, bio, phone, preferences });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    // Cascade delete all user data
    await Person.deleteMany({ userId });
    await Action.deleteMany({ userId });
    await ActivityLog.deleteMany({ userId });
    await Initiative.deleteMany({ userId });
    await Organization.deleteMany({ userId });
    await Note.deleteMany({ userId });
    await Reminder.deleteMany({ userId });
    await Suggestion.deleteMany({ userId });

    // Delete the user account itself
    const user = await authService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    await user.deleteOne();

    res.json({ success: true, message: 'Account and all associated data deleted' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send(getVerificationHtml('Invalid Link', 'The verification link is invalid.', false));
      return;
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      // Check if token exists but expired
      const expiredUser = await User.findOne({ emailVerificationToken: token });
      if (expiredUser) {
        res.status(400).send(getVerificationHtml('Link Expired', 'This verification link has expired. Please request a new one.', false));
        return;
      }
      res.status(400).send(getVerificationHtml('Invalid Link', 'This verification link is invalid or has already been used.', false));
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const apiBaseUrl = process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5173';
    res.send(getVerificationHtml('Email Verified!', 'Your email has been successfully verified. Redirecting to Seeds...', true, apiBaseUrl));
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, error: 'Email is already verified' });
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error('[AUTH] Failed to send verification email:', err);
    });

    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email (non-blocking)
    sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      console.error('[AUTH] Failed to send password reset email:', err);
    });

    res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, error: 'Token and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
      return;
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}

// Helper function to generate verification result HTML
function getVerificationHtml(title: string, message: string, success: boolean, redirectUrl?: string): string {
  const emerald = '#087F5B';
  const gold = '#E6C47A';
  const darkForest = '#071A16';
  
  const redirectScript = success && redirectUrl 
    ? `<script>setTimeout(() => window.location.href = "${redirectUrl}", 3000);</script>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${redirectScript}
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #F8FAF9, #EEF2F1); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 24px; padding: 48px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
    .icon { width: 80px; height: 80px; margin: 0 auto 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .icon.success { background: linear-gradient(135deg, ${emerald}, #0A9E72); }
    .icon.error { background: linear-gradient(135deg, #DC2626, #EF4444); }
    .icon svg { width: 40px; height: 40px; color: white; }
    h1 { font-size: 28px; font-weight: 700; color: ${darkForest}; margin: 0 0 16px; }
    p { font-size: 16px; color: #5C6B68; line-height: 1.6; margin: 0 0 32px; }
    .logo { font-size: 24px; font-weight: 700; color: ${emerald}; margin-top: 32px; }
    .logo span { color: ${gold}; }
    .btn { display: inline-block; background: linear-gradient(135deg, ${emerald}, #0A9E72); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${success ? 'success' : 'error'}">
      ${success 
        ? '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
        : '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>'
      }
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${!success ? '<a href="/" class="btn">Go to Seeds</a>' : ''}
    <div class="logo">Seeds<span>.</span></div>
  </div>
</body>
</html>
  `;
}
