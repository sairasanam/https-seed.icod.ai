import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  entityId?: mongoose.Types.ObjectId;
  entityType?: 'person' | 'action' | 'initiative';
  content: string;
  isPrivate: boolean;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String, enum: ['person', 'action', 'initiative'] },
    content: { type: String, required: true, trim: true },
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1 });
noteSchema.index({ entityId: 1 });

export default mongoose.model<INote>('Note', noteSchema);
