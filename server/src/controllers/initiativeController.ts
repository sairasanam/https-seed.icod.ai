import type { Request, Response, NextFunction } from 'express';
import Initiative from '../models/Initiative';

export async function getInitiatives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { status, search, sort, template } = req.query;

    const filter: any = { userId };

    // Filter out templates unless explicitly requested
    if (template === 'true') {
      filter.template = true;
    } else if (template !== 'all') {
      filter.template = { $ne: true };
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortField: any = { updatedAt: -1 };
    if (sort === 'dateCreated') sortField = { createdAt: -1 };
    else if (sort === 'dueDate') sortField = { completedAt: 1 };
    else if (sort === 'progress') sortField = { updatedAt: -1 }; // progress sorting handled client-side

    const initiatives = await Initiative.find(filter).sort(sortField);

    res.json({ success: true, data: initiatives });
  } catch (err) {
    next(err);
  }
}

export async function getInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const initiative = await Initiative.findOne({ _id: req.params.id, userId });

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function createInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { title, description, category, participants, frequency, impactLevel, location, objectives, tasks, template } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ success: false, error: 'Title, description, and category are required' });
      return;
    }

    const initiative = await Initiative.create({
      userId,
      title,
      description,
      category,
      participants: participants || [],
      frequency,
      impactLevel,
      location,
      objectives: objectives || [],
      tasks: (tasks || []).map((t: { title: string }) => ({ title: t.title, completed: false })),
      template: template || false,
      status: 'planned',
    });

    res.status(201).json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function updateInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { title, description, category, participants, status, documentation, frequency, impactLevel, location, objectives } = req.body;

    const updateData: any = { title, description, category, participants, documentation, frequency, impactLevel, location, objectives };
    if (status === 'completed') {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    } else if (status === 'active') {
      updateData.status = 'active';
    } else if (status === 'planned') {
      updateData.status = 'planned';
    } else if (status) {
      updateData.status = status;
    }

    const initiative = await Initiative.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function deleteInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const initiative = await Initiative.findOneAndDelete({ _id: req.params.id, userId });

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    res.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function archiveInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const initiative = await Initiative.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'archived', archived: true },
      { new: true }
    );

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function addTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { title } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: 'Task title is required' });
      return;
    }

    const initiative = await Initiative.findOne({ _id: req.params.id, userId });

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    initiative.tasks.push({ title: title.trim(), completed: false });
    await initiative.save();

    res.status(201).json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function toggleTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { taskId } = req.params;

    const initiative = await Initiative.findOne({ _id: req.params.id, userId });

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    const task = initiative.tasks.find(t => t._id?.toString() === taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    await initiative.save();

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function removeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { taskId } = req.params;

    const initiative = await Initiative.findOne({ _id: req.params.id, userId });

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    const taskIndex = initiative.tasks.findIndex(t => t._id?.toString() === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    initiative.tasks.splice(taskIndex, 1);
    await initiative.save();

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}

export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const templates = await Initiative.find({ userId, template: true }).sort({ updatedAt: -1 });

    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function createFromTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const templateId = req.params.templateId;

    const template = await Initiative.findOne({ _id: templateId, userId, template: true });

    if (!template) {
      res.status(404).json({ success: false, error: 'Template not found' });
      return;
    }

    const newInitiative = await Initiative.create({
      userId,
      title: template.title,
      description: template.description,
      category: template.category,
      participants: [],
      objectives: [...template.objectives],
      tasks: template.tasks.map(t => ({ title: t.title, completed: false })),
      frequency: template.frequency,
      impactLevel: template.impactLevel,
      location: template.location,
      template: false,
      status: 'planned',
    });

    res.status(201).json({ success: true, data: newInitiative });
  } catch (err) {
    next(err);
  }
}
