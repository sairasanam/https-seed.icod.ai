import Reminder from '../models/Reminder';
import User from '../models/User';
import Person from '../models/Person';
import Initiative from '../models/Initiative';
import Organization from '../models/Organization';
import { sendReminderEmail } from './emailService';

interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once';
  interval?: number;
}

function parseRecurrenceRule(rule?: string): RecurrenceRule {
  if (!rule) return { type: 'once' };
  
  try {
    const parsed = JSON.parse(rule);
    return parsed as RecurrenceRule;
  } catch {
    // Handle simple string formats
    if (rule === 'daily') return { type: 'daily', interval: 1 };
    if (rule === 'weekly') return { type: 'weekly', interval: 1 };
    if (rule === 'monthly') return { type: 'monthly', interval: 1 };
    if (rule === 'yearly') return { type: 'yearly', interval: 1 };
    return { type: 'once' };
  }
}

function calculateNextTrigger(currentDate: Date, rule: RecurrenceRule): Date | null {
  const next = new Date(currentDate);
  
  switch (rule.type) {
    case 'daily':
      next.setDate(next.getDate() + (rule.interval || 1));
      return next;
    case 'weekly':
      next.setDate(next.getDate() + 7 * (rule.interval || 1));
      return next;
    case 'monthly':
      next.setMonth(next.getMonth() + (rule.interval || 1));
      return next;
    case 'yearly':
      next.setFullYear(next.getFullYear() + (rule.interval || 1));
      return next;
    case 'once':
      return null;
    default:
      return null;
  }
}

async function resolveEntityName(entityType: string, entityId: string): Promise<string> {
  try {
    if (entityType === 'person') {
      const person = await Person.findById(entityId);
      return person?.name || 'Unknown';
    }
    if (entityType === 'initiative') {
      const initiative = await Initiative.findById(entityId);
      return initiative?.title || 'Unknown';
    }
    if (entityType === 'organization') {
      const org = await Organization.findById(entityId);
      return org?.name || 'Unknown';
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export async function checkAndProcessReminders(): Promise<void> {
  try {
    const now = new Date();
    
    // Find all due reminders that are active
    const dueReminders = await Reminder.find({
      isActive: true,
      nextTriggerAt: { $lte: now },
    });

    if (dueReminders.length === 0) return;

    console.log(`[REMINDER] Processing ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      try {
        // Get user info
        const user = await User.findById(reminder.userId);
        if (!user) {
          // User doesn't exist, deactivate reminder
          reminder.isActive = false;
          await reminder.save();
          continue;
        }

        // Check if user has email notifications enabled
        const emailEnabled = user.preferences?.notifications?.email !== false;
        const remindersEnabled = user.preferences?.notifications?.reminders !== false;
        
        // Only send email if both email and reminders are enabled
        if (emailEnabled && remindersEnabled && reminder.notificationPreference === 'email') {
          const entityName = await resolveEntityName(reminder.entityType, reminder.entityId.toString());
          const message = reminder.message.replace('____', entityName);
          
          // Send email (non-blocking)
          sendReminderEmail(user.email, user.name, message, entityName).catch((err) => {
            console.error(`[REMINDER] Failed to send email for reminder ${reminder._id}:`, err);
          });
        }

        // Calculate next trigger or deactivate
        const rule = parseRecurrenceRule(reminder.recurrenceRule);
        const nextTrigger = calculateNextTrigger(now, rule);

        if (nextTrigger) {
          reminder.nextTriggerAt = nextTrigger;
        } else {
          // One-time reminder, mark as inactive
          reminder.isActive = false;
        }

        await reminder.save();
      } catch (err) {
        console.error(`[REMINDER] Error processing reminder ${reminder._id}:`, err);
      }
    }

    console.log(`[REMINDER] Processed ${dueReminders.length} reminders`);
  } catch (err) {
    console.error('[REMINDER] Error in checkAndProcessReminders:', err);
  }
}

// Start the reminder checker interval
let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderChecker(intervalMs: number = 60000): void {
  if (reminderInterval) return;
  
  console.log(`[REMINDER] Starting reminder checker (interval: ${intervalMs}ms)`);
  
  // Run immediately on start
  checkAndProcessReminders();
  
  // Then run on interval
  reminderInterval = setInterval(() => {
    checkAndProcessReminders();
  }, intervalMs);
}

export function stopReminderChecker(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log('[REMINDER] Reminder checker stopped');
  }
}
