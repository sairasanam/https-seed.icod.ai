import type { Request, Response, NextFunction } from 'express';
import Action from '../models/Action';
import Person from '../models/Person';
import ActivityLog from '../models/ActivityLog';

export async function getActions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { personId, status, category, priority, sortBy, sortOrder } = req.query;

    const filter: any = { userId };
    if (personId) filter.personId = personId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Default sort by createdAt descending
    let sortOptions: any = { createdAt: -1 };
    if (sortBy) {
      sortOptions = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };
    }

    const actions = await Action.find(filter).sort(sortOptions);

    res.json({ success: true, data: actions });
  } catch (err) {
    next(err);
  }
}

export async function createAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { personId, title, description, category, priority, dueDate, tags, notes } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    const action = await Action.create({
      userId,
      personId,
      title,
      description,
      category: category || 'other',
      priority: priority || 'medium',
      dueDate,
      tags: tags || [],
      notes,
      completed: false,
      status: 'pending',
    });

    // Create activity log entry
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId,
      type: 'created',
      newStatus: 'pending',
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function updateAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { title, description, category, priority, dueDate, tags, notes } = req.body;

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title, description, category, priority, dueDate, tags, notes },
      { new: true }
    );

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Log the update
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId: action.personId,
      type: 'updated',
      newStatus: action.status,
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function completeAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    // Check if already completed
    const existingAction = await Action.findOne({ _id: req.params.id, userId });
    if (!existingAction) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    if (existingAction.status === 'completed') {
      res.status(400).json({ success: false, error: 'Action is already completed' });
      return;
    }

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId },
      { 
        completed: true, 
        completedAt: new Date(),
        status: 'completed' 
      },
      { new: true }
    );

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Update person's last contact date if action is linked to a person
    if (action.personId) {
      await Person.findByIdAndUpdate(action.personId, { lastContactDate: new Date() });
    }

    // Create activity log entry
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId: action.personId,
      type: 'completed',
      previousStatus: existingAction.status,
      newStatus: 'completed',
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function undoAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const existingAction = await Action.findOne({ _id: req.params.id, userId });
    if (!existingAction) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    if (existingAction.status !== 'completed') {
      res.status(400).json({ success: false, error: 'Can only undo completed actions' });
      return;
    }

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId },
      { 
        completed: false, 
        completedAt: null,
        status: 'pending' 
      },
      { new: true }
    );

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Create activity log entry
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId: action.personId,
      type: 'undone',
      previousStatus: 'completed',
      newStatus: 'pending',
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function postponeAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { dueDate } = req.body;

    if (!dueDate) {
      res.status(400).json({ success: false, error: 'New due date is required' });
      return;
    }

    const existingAction = await Action.findOne({ _id: req.params.id, userId });
    if (!existingAction) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    if (existingAction.status === 'completed' || existingAction.status === 'dismissed') {
      res.status(400).json({ success: false, error: 'Cannot postpone completed or dismissed actions' });
      return;
    }

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId },
      { 
        dueDate: new Date(dueDate),
        status: 'postponed' 
      },
      { new: true }
    );

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Create activity log entry
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId: action.personId,
      type: 'postponed',
      previousStatus: existingAction.status,
      newStatus: 'postponed',
      notes: `Due date changed to ${new Date(dueDate).toLocaleDateString()}`,
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function dismissAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const existingAction = await Action.findOne({ _id: req.params.id, userId });
    if (!existingAction) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    if (existingAction.status === 'completed') {
      res.status(400).json({ success: false, error: 'Cannot dismiss completed actions' });
      return;
    }

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'dismissed' },
      { new: true }
    );

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Create activity log entry
    await ActivityLog.create({
      userId,
      actionId: action._id,
      personId: action.personId,
      type: 'dismissed',
      previousStatus: existingAction.status,
      newStatus: 'dismissed',
      snapshot: {
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        dueDate: action.dueDate,
      },
    });

    res.json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
}

export async function deleteAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const action = await Action.findOneAndDelete({ _id: req.params.id, userId });

    if (!action) {
      res.status(404).json({ success: false, error: 'Action not found' });
      return;
    }

    // Also delete related activity logs
    await ActivityLog.deleteMany({ actionId: action._id });

    res.json({ success: true, message: 'Action deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { actionId, personId, limit = 20 } = req.query;

    const filter: any = { userId };
    if (actionId) filter.actionId = actionId;
    if (personId) filter.personId = personId;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}
