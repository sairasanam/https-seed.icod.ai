import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  actionId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  type: 'completed' | 'undone' | 'postponed' | 'dismissed' | 'created' | 'updated';
  previousStatus?: string;
  newStatus: string;
  notes?: string;
  snapshot: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: Date;
  };
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionId: { type: Schema.Types.ObjectId, ref: 'Action', required: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person' },
    type: {
      type: String,
      enum: ['completed', 'undone', 'postponed', 'dismissed', 'created', 'updated'],
      required: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    notes: { type: String, trim: true },
    snapshot: {
      title: { type: String, required: true },
      description: { type: String },
      category: { type: String },
      priority: { type: String },
      dueDate: { type: Date },
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ actionId: 1 });
activityLogSchema.index({ personId: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
