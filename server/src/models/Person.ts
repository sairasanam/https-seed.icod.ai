import mongoose, { Schema, Document } from 'mongoose';

export interface IPerson extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: string;
  category?: 'family' | 'friend' | 'colleague' | 'mentor' | 'mentee' | 'other';
  tags: string[];
  interests: string[];
  importantDates: {
    birthday?: Date;
    anniversary?: Date;
    custom?: Array<{ label: string; date: Date }>;
  };
  lastContactDate?: Date;
  notes?: string;
}

const personSchema = new Schema<IPerson>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['family', 'friend', 'colleague', 'mentor', 'mentee', 'other'],
      default: 'other',
    },
    tags: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    importantDates: {
      birthday: { type: Date },
      anniversary: { type: Date },
      custom: [
        {
          label: { type: String, trim: true },
          date: { type: Date },
        },
      ],
    },
    lastContactDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

personSchema.index({ userId: 1 });
personSchema.index({ category: 1 });

export default mongoose.model<IPerson>('Person', personSchema);
