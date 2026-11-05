import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  entityId: mongoose.Types.ObjectId;
  entityType: 'person' | 'initiative' | 'organization';
  message: string;
  recurrenceRule?: string;
  lastTriggeredAt?: Date;
  nextTriggerAt?: Date;
  isActive: boolean;
  timezone: string;
  notificationPreference: 'push' | 'email' | 'in-app';
  snoozeCount: number;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ['person', 'initiative', 'organization'], required: true },
    message: { type: String, required: true, trim: true },
    recurrenceRule: { type: String, trim: true },
    lastTriggeredAt: { type: Date },
    nextTriggerAt: { type: Date },
    isActive: { type: Boolean, default: true },
    timezone: { type: String, default: 'UTC', trim: true },
    notificationPreference: {
      type: String,
      enum: ['push', 'email', 'in-app'],
      default: 'in-app',
    },
    snoozeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1 });
reminderSchema.index({ nextTriggerAt: 1 });
reminderSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IReminder>('Reminder', reminderSchema);
