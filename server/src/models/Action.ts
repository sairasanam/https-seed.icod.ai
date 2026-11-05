import mongoose, { Schema, Document } from 'mongoose';

export interface IAction extends Document {
  userId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  initiativeId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category?: 'call' | 'message' | 'visit' | 'gift' | 'activity' | 'other';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status: 'pending' | 'completed' | 'postponed' | 'dismissed';
  completed: boolean; // Keep for backward compatibility
  tags: string[];
  notes?: string;
  completedAt?: Date;
}

const actionSchema = new Schema<IAction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person' },
    initiativeId: { type: Schema.Types.ObjectId, ref: 'Initiative' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['call', 'message', 'visit', 'gift', 'activity', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'completed', 'postponed', 'dismissed'],
      default: 'pending',
    },
    completed: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

actionSchema.index({ userId: 1 });
actionSchema.index({ personId: 1 });
actionSchema.index({ initiativeId: 1 });
actionSchema.index({ status: 1 });
actionSchema.index({ dueDate: 1 });

export default mongoose.model<IAction>('Action', actionSchema);
