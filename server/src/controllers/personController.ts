import type { Request, Response, NextFunction } from 'express';
import Person from '../models/Person';
import Action from '../models/Action';
import ActivityLog from '../models/ActivityLog';

export async function getPeople(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const people = await Person.find({ userId }).sort({ updatedAt: -1 });

    res.json({ success: true, data: people });
  } catch (err) {
    next(err);
  }
}

export async function getPerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const person = await Person.findOne({ _id: req.params.id, userId });

    if (!person) {
      res.status(404).json({ success: false, error: 'Person not found' });
      return;
    }

    // Get actions for this person
    const actions = await Action.find({ userId, personId: person._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { person, actions } });
  } catch (err) {
    next(err);
  }
}

export async function createPerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { name, relationship, category, tags, interests, importantDates, notes } = req.body;

    if (!name || !relationship) {
      res.status(400).json({ success: false, error: 'Name and relationship are required' });
      return;
    }

    const person = await Person.create({
      userId,
      name,
      relationship,
      category: category || 'other',
      tags: tags || [],
      interests: interests || [],
      importantDates,
      notes,
    });

    res.status(201).json({ success: true, data: person });
  } catch (err) {
    next(err);
  }
}

export async function updatePerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { name, relationship, category, tags, interests, importantDates, notes } = req.body;

    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name, relationship, category, tags, interests, importantDates, notes },
      { new: true }
    );

    if (!person) {
      res.status(404).json({ success: false, error: 'Person not found' });
      return;
    }

    res.json({ success: true, data: person });
  } catch (err) {
    next(err);
  }
}

export async function deletePerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const person = await Person.findOneAndDelete({ _id: req.params.id, userId });

    if (!person) {
      res.status(404).json({ success: false, error: 'Person not found' });
      return;
    }

    // Delete associated actions and their activity logs
    const actions = await Action.find({ personId: person._id });
    const actionIds = actions.map(a => a._id);
    
    if (actionIds.length > 0) {
      await ActivityLog.deleteMany({ actionId: { $in: actionIds } });
    }
    
    await Action.deleteMany({ personId: person._id });
    
    // Also delete activity logs directly associated with this person
    await ActivityLog.deleteMany({ personId: person._id });

    res.json({ success: true, message: 'Person deleted successfully' });
  } catch (err) {
    next(err);
  }
}
