import type { Request, Response, NextFunction } from 'express';
import Note from '../models/Note';

export async function getNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { entityId, entityType } = req.query;

    const filter: any = { userId };
    if (entityId) filter.entityId = entityId;
    if (entityType) filter.entityType = entityType;

    const notes = await Note.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { entityId, entityType, content, isPrivate } = req.body;

    if (!content) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    const note = await Note.create({
      userId,
      entityId,
      entityType,
      content,
      isPrivate: isPrivate !== false,
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { content, isPrivate } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId },
      { content, isPrivate },
      { new: true }
    );

    if (!note) {
      res.status(404).json({ success: false, error: 'Note not found' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const note = await Note.findOneAndDelete({ _id: req.params.id, userId });

    if (!note) {
      res.status(404).json({ success: false, error: 'Note not found' });
      return;
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function searchNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { q } = req.query;

    if (!q || typeof q !== 'string' || !q.trim()) {
      res.status(400).json({ success: false, error: 'Search query (q) is required' });
      return;
    }

    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const notes = await Note.find({
      userId,
      $or: [
        { content: { $regex: regex } },
      ],
    }).sort({ updatedAt: -1 });

    res.json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
}
