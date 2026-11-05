import mongoose, { Schema, Document } from 'mongoose';

export interface IContentLibraryItem extends Document {
  title: string;
  content: string;
  category: string;
  type: 'suggestion' | 'initiative';
  tags: string[];
  treeType: 'inner' | 'community' | 'outer';
}

const contentLibraryItemSchema = new Schema<IContentLibraryItem>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    type: { type: String, enum: ['suggestion', 'initiative'], required: true },
    tags: [{ type: String, trim: true }],
    treeType: { type: String, enum: ['inner', 'community', 'outer'], required: true },
  },
  { timestamps: true }
);

contentLibraryItemSchema.index({ category: 1 });
contentLibraryItemSchema.index({ type: 1 });
contentLibraryItemSchema.index({ treeType: 1 });

export default mongoose.model<IContentLibraryItem>('ContentLibraryItem', contentLibraryItemSchema);
