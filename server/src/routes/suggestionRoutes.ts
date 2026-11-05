import express from 'express';
import * as suggestionController from '../controllers/suggestionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimit } from '../middleware/rateLimiter';

const router = express.Router();

router.use(authMiddleware);

// Rate limit AI generation: 20 requests per hour per IP
const suggestionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many AI suggestions requested. Please try again later.' });

router.post('/generate', suggestionLimiter, suggestionController.generateSuggestions);
router.get('/saved', suggestionController.getSavedSuggestions);
router.patch('/:id/save', suggestionController.saveSuggestion);
router.patch('/:id/complete', suggestionController.markSuggestionCompleted);
router.delete('/:id', suggestionController.dismissSuggestion);

export default router;
