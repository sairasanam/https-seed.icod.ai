import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolves __dirname in ES modules and loads .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorMiddleware';
import { UPLOADS_DIR } from './paths';
import { seedDatabase } from './services/seedService';
import { startReminderChecker } from './services/reminderChecker';

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes';
import personRoutes from './routes/personRoutes';
import actionRoutes from './routes/actionRoutes';
import initiativeRoutes from './routes/initiativeRoutes';
import organizationRoutes from './routes/organizationRoutes';
import suggestionRoutes from './routes/suggestionRoutes';
import noteRoutes from './routes/noteRoutes';
import reminderRoutes from './routes/reminderRoutes';
import treeRoutes from './routes/treeRoutes';
import exploreRoutes from './routes/exploreRoutes';
import adminRoutes from './routes/adminRoutes';

// ─── Config ───────────────────────────────────────────────────────────────────
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/my_db';

// ─── CORS ─────────────────────────────────────────────────────────────────────
let apiOrigin: string | null = null;
try {
  if (process.env.VITE_API_URL) apiOrigin = new URL(process.env.VITE_API_URL).origin;
} catch {
  // VITE_API_URL missing or not a valid URL — leave null (localhost-only below).
}
const corsOrigins: (string | RegExp)[] = [/^http:\/\/localhost:\d+$/];
if (apiOrigin) corsOrigins.push(apiOrigin);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use('/api/uploads', express.static(UPLOADS_DIR));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) =>
  res.json({ success: true, message: 'Server is running' })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/people', personRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/tree', treeRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/admin', adminRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── DB + Server Bootstrap ────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connected to MongoDB');

    // Run seeders
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
      
      // Start reminder checker after server is running
      startReminderChecker(60000); // Check every 60 seconds
    });
  } catch (err) {
    console.error('[STARTUP] Failed to start server:', err);
    process.exit(1);
  }
}

start();
