import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService';
import Suggestion from '../models/Suggestion';

export async function generateSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { context, treeType, preferences } = req.body;

    if (!context || typeof context !== 'string' || !context.trim()) {
      res.status(400).json({ success: false, error: 'Context is required' });
      return;
    }

    // Validate treeType
    const validTreeTypes = ['inner', 'community', 'outer'];
    const selectedTreeType = validTreeTypes.includes(treeType) ? treeType : 'inner';

    // Generate suggestions using AI service
    const suggestions = await aiService.generateSuggestions({
      context: context.trim(),
      treeType: selectedTreeType,
      preferences: preferences || {},
    });

    // Save the suggestion record
    const savedSuggestion = await Suggestion.create({
      userId,
      promptContext: context.trim(),
      treeType: selectedTreeType,
      content: suggestions,
      saved: false,
    });

    res.json({
      success: true,
      data: {
        id: savedSuggestion._id,
        suggestions,
      },
    });
  } catch (err) {
    console.error('[SUGGESTIONS] Generation failed:', err);
    next(err);
  }
}

export async function getSavedSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const suggestions = await Suggestion.find({ userId, saved: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
}

export async function saveSuggestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const suggestion = await Suggestion.findOneAndUpdate(
      { _id: req.params.id, userId },
      { saved: true },
      { new: true }
    );

    if (!suggestion) {
      res.status(404).json({ success: false, error: 'Suggestion not found' });
      return;
    }

    res.json({ success: true, data: suggestion });
  } catch (err) {
    next(err);
  }
}

export async function markSuggestionCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { index } = req.body;

    if (typeof index !== 'number' || index < 0) {
      res.status(400).json({ success: false, error: 'Valid index is required' });
      return;
    }

    const suggestion = await Suggestion.findOne({ _id: req.params.id, userId });

    if (!suggestion) {
      res.status(404).json({ success: false, error: 'Suggestion not found' });
      return;
    }

    if (!suggestion.completedIndices.includes(index)) {
      suggestion.completedIndices.push(index);
      await suggestion.save();
    }

    res.json({ success: true, data: suggestion });
  } catch (err) {
    next(err);
  }
}

export async function dismissSuggestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const result = await Suggestion.deleteOne({ _id: req.params.id, userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, error: 'Suggestion not found' });
      return;
    }

    res.json({ success: true, message: 'Suggestion dismissed' });
  } catch (err) {
    next(err);
  }
}
