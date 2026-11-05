import type { Request, Response, NextFunction } from 'express';
import * as reminderService from '../services/reminderService';

export async function getReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const [activeReminders, staleRelationships] = await Promise.all([
      reminderService.getActiveReminders(userId),
      reminderService.checkStaleRelationships(userId),
    ]);

    // Combine and deduplicate
    const allReminders = [...activeReminders];
    for (const stale of staleRelationships) {
      if (!allReminders.some(r => r.entityId === stale.entityId)) {
        allReminders.push(stale);
      }
    }

    res.json({ success: true, data: allReminders });
  } catch (err) {
    next(err);
  }
}

export async function getAllReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const reminders = await reminderService.getAllReminders(userId);
    res.json({ success: true, data: reminders });
  } catch (err) {
    next(err);
  }
}

export async function createReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { entityId, entityType, message, recurrenceRule } = req.body;

    if (!entityId || !entityType || !message) {
      res.status(400).json({ success: false, error: 'Entity ID, entity type, and message are required' });
      return;
    }

    await reminderService.createReminder(userId, entityId, entityType, message, recurrenceRule);

    res.status(201).json({ success: true, message: 'Reminder created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { message, recurrenceRule, nextTriggerAt } = req.body;

    const updates: Record<string, unknown> = {};
    if (message !== undefined) updates.message = message;
    if (recurrenceRule !== undefined) updates.recurrenceRule = recurrenceRule;
    if (nextTriggerAt !== undefined) updates.nextTriggerAt = new Date(nextTriggerAt);

    const updated = await reminderService.updateReminder(userId, req.params.id, updates);

    if (!updated) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const deleted = await reminderService.deactivateReminder(userId, req.params.id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }

    res.json({ success: true, message: 'Reminder deactivated' });
  } catch (err) {
    next(err);
  }
}

export async function snoozeReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { duration } = req.body; // duration in ms or preset: '1h', '1d', '1w'

    let durationMs: number;
    if (typeof duration === 'number') {
      durationMs = duration;
    } else if (duration === '1h') {
      durationMs = 60 * 60 * 1000;
    } else if (duration === '1d') {
      durationMs = 24 * 60 * 60 * 1000;
    } else if (duration === '1w') {
      durationMs = 7 * 24 * 60 * 60 * 1000;
    } else {
      res.status(400).json({ success: false, error: 'Invalid duration. Use milliseconds or "1h", "1d", "1w"' });
      return;
    }

    const snoozed = await reminderService.snoozeReminder(userId, req.params.id, durationMs);

    if (!snoozed) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }

    res.json({ success: true, data: snoozed });
  } catch (err) {
    next(err);
  }
}

export async function rescheduleReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { nextTriggerAt } = req.body;

    if (!nextTriggerAt) {
      res.status(400).json({ success: false, error: 'nextTriggerAt is required' });
      return;
    }

    const rescheduled = await reminderService.rescheduleReminder(
      userId,
      req.params.id,
      new Date(nextTriggerAt)
    );

    if (!rescheduled) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }

    res.json({ success: true, data: rescheduled });
  } catch (err) {
    next(err);
  }
}
