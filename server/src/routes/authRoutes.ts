import express from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimit } from '../middleware/rateLimiter';

const router = express.Router();

// Rate limit: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again in 15 minutes.' });

// Rate limit for password reset requests
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many password reset requests. Please try again in an hour.' });

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authMiddleware, authController.resendVerification);
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.delete('/account', authMiddleware, authController.deleteAccount);

export default router;
