import mongoose, { Schema, Document } from 'mongoose';

export interface IInitiativeTask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IInitiative extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  participants: string[];
  status: 'planned' | 'active' | 'completed' | 'archived';
  documentation?: string;
  frequency?: string;
  impactLevel?: 'low' | 'medium' | 'high';
  location?: string;
  objectives: string[];
  tasks: IInitiativeTask[];
  archived: boolean;
  template: boolean;
  featured: boolean;
  completedAt?: Date;
}

const taskSchema = new Schema<IInitiativeTask>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const initiativeSchema = new Schema<IInitiative>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    participants: [{ type: String, trim: true }],
    status: { type: String, enum: ['planned', 'active', 'completed', 'archived'], default: 'planned' },
    documentation: { type: String, trim: true },
    frequency: { type: String, trim: true },
    impactLevel: { type: String, enum: ['low', 'medium', 'high'] },
    location: { type: String, trim: true },
    objectives: [{ type: String, trim: true }],
    tasks: [taskSchema],
    archived: { type: Boolean, default: false },
    template: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

initiativeSchema.index({ userId: 1 });
initiativeSchema.index({ userId: 1, template: 1 });
initiativeSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IInitiative>('Initiative', initiativeSchema);
