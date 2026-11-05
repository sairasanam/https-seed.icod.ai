import mongoose from 'mongoose';
import Reminder from '../models/Reminder';
import Person from '../models/Person';

export interface ActiveReminder {
  id: string;
  message: string;
  entityType: 'person' | 'initiative' | 'organization';
  entityId: string;
  entityName: string;
  nextTriggerAt?: Date;
  isActive: boolean;
  snoozeCount: number;
  timezone: string;
  notificationPreference: 'push' | 'email' | 'in-app';
  recurrenceRule?: string;
}

async function resolveEntityName(entityType: string, entityId: mongoose.Types.ObjectId | string): Promise<string> {
  if (entityType === 'person') {
    const person = await Person.findById(entityId);
    return person?.name || 'Unknown';
  }
  if (entityType === 'initiative') {
    const Initiative = (await import('../models/Initiative')).default;
    const initiative = await Initiative.findById(entityId);
    return initiative?.title || 'Unknown';
  }
  if (entityType === 'organization') {
    const Organization = (await import('../models/Organization')).default;
    const org = await Organization.findById(entityId);
    return org?.name || 'Unknown';
  }
  return 'Unknown';
}

function mapToActiveReminder(reminder: any, entityName: string): ActiveReminder {
  return {
    id: reminder._id.toString(),
    message: reminder.message.replace('____', entityName),
    entityType: reminder.entityType,
    entityId: reminder.entityId.toString(),
    entityName,
    nextTriggerAt: reminder.nextTriggerAt,
    isActive: reminder.isActive,
    snoozeCount: reminder.snoozeCount || 0,
    timezone: reminder.timezone || 'UTC',
    notificationPreference: reminder.notificationPreference || 'in-app',
    recurrenceRule: reminder.recurrenceRule,
  };
}

export async function getActiveReminders(userId: string): Promise<ActiveReminder[]> {
  const reminders = await Reminder.find({
    userId,
    isActive: true,
    nextTriggerAt: { $lte: new Date() },
  });

  const activeReminders: ActiveReminder[] = [];

  for (const reminder of reminders) {
    const entityName = await resolveEntityName(reminder.entityType, reminder.entityId);
    activeReminders.push(mapToActiveReminder(reminder, entityName));
  }

  return activeReminders;
}

export async function getAllReminders(userId: string): Promise<ActiveReminder[]> {
  const reminders = await Reminder.find({ userId }).sort({ nextTriggerAt: 1 });

  const result: ActiveReminder[] = [];
  for (const reminder of reminders) {
    const entityName = await resolveEntityName(reminder.entityType, reminder.entityId);
    result.push(mapToActiveReminder(reminder, entityName));
  }

  return result;
}

export async function createReminder(
  userId: string,
  entityId: string,
  entityType: 'person' | 'initiative' | 'organization',
  message: string,
  recurrenceRule?: string
): Promise<void> {
  const now = new Date();
  const nextTriggerAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // Default: 2 weeks

  await Reminder.create({
    userId,
    entityId,
    entityType,
    message,
    recurrenceRule,
    nextTriggerAt,
    isActive: true,
  });
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  updates: { message?: string; recurrenceRule?: string; nextTriggerAt?: Date }
): Promise<ActiveReminder | null> {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: reminderId, userId },
    { $set: updates },
    { new: true }
  );

  if (!reminder) return null;

  const entityName = await resolveEntityName(reminder.entityType, reminder.entityId);
  return mapToActiveReminder(reminder, entityName);
}

export async function deleteReminder(userId: string, reminderId: string): Promise<boolean> {
  const result = await Reminder.findOneAndDelete({ _id: reminderId, userId });
  return !!result;
}

export async function deactivateReminder(userId: string, reminderId: string): Promise<boolean> {
  const result = await Reminder.findOneAndUpdate(
    { _id: reminderId, userId },
    { $set: { isActive: false } },
    { new: true }
  );
  return !!result;
}

export async function snoozeReminder(
  userId: string,
  reminderId: string,
  durationMs: number
): Promise<ActiveReminder | null> {
  const now = new Date();
  const nextTriggerAt = new Date(now.getTime() + durationMs);

  const reminder = await Reminder.findOneAndUpdate(
    { _id: reminderId, userId },
    {
      $set: { nextTriggerAt },
      $inc: { snoozeCount: 1 },
    },
    { new: true }
  );

  if (!reminder) return null;

  const entityName = await resolveEntityName(reminder.entityType, reminder.entityId);
  return mapToActiveReminder(reminder, entityName);
}

export async function rescheduleReminder(
  userId: string,
  reminderId: string,
  nextTriggerAt: Date
): Promise<ActiveReminder | null> {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: reminderId, userId },
    { $set: { nextTriggerAt } },
    { new: true }
  );

  if (!reminder) return null;

  const entityName = await resolveEntityName(reminder.entityType, reminder.entityId);
  return mapToActiveReminder(reminder, entityName);
}

export async function checkStaleRelationships(userId: string): Promise<ActiveReminder[]> {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const stalePeople = await Person.find({
    userId,
    lastContactDate: { $lt: twoWeeksAgo },
  });

  const reminders: ActiveReminder[] = stalePeople.map(person => ({
    id: person._id.toString(),
    message: `You haven't reached out to ${person.name} in 2 weeks`,
    entityType: 'person' as const,
    entityId: person._id.toString(),
    entityName: person.name,
    isActive: true,
    snoozeCount: 0,
    timezone: 'UTC',
    notificationPreference: 'in-app' as const,
  }));

  return reminders;
}
