import mongoose, { Schema, Document } from 'mongoose';

export interface ISuggestionContent {
  title: string;
  explanation: string;
  steps: string[];
  category: string;
  estimatedTime: string;
  budget?: string;
}

export interface ISuggestion extends Document {
  userId: mongoose.Types.ObjectId;
  promptContext: string;
  treeType: 'inner' | 'community' | 'outer';
  content: ISuggestionContent[];
  saved: boolean;
  completedIndices: number[];
}

const suggestionContentSchema = new Schema<ISuggestionContent>(
  {
    title: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    steps: [{ type: String, trim: true }],
    category: { type: String, required: true, trim: true },
    estimatedTime: { type: String, required: true, trim: true },
    budget: { type: String, trim: true },
  },
  { _id: false }
);

const suggestionSchema = new Schema<ISuggestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    promptContext: { type: String, required: true, trim: true },
    treeType: { type: String, enum: ['inner', 'community', 'outer'], default: 'inner' },
    content: [suggestionContentSchema],
    saved: { type: Boolean, default: false },
    completedIndices: [{ type: Number }],
  },
  { timestamps: true }
);

suggestionSchema.index({ userId: 1 });
suggestionSchema.index({ userId: 1, saved: 1 });

export default mongoose.model<ISuggestion>('Suggestion', suggestionSchema);
