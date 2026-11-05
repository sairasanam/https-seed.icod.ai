import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'nonprofit' | 'church' | 'environmental' | 'community' | 'cause' | 'other';
  description?: string;
  website?: string;
  donationLink?: string;
  serviceLink?: string;
  opportunities: string[];
  followed: boolean;
  favorites: boolean;
  verified: boolean;
  featured: boolean;
  address?: string;
  phone?: string;
  email?: string;
  donationUrl?: string;
  volunteerUrl?: string;
}

const organizationSchema = new Schema<IOrganization>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['nonprofit', 'church', 'environmental', 'community', 'cause', 'other'], required: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    donationLink: { type: String, trim: true },
    serviceLink: { type: String, trim: true },
    opportunities: [{ type: String, trim: true }],
    followed: { type: Boolean, default: false },
    favorites: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    donationUrl: { type: String, trim: true },
    volunteerUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

organizationSchema.index({ userId: 1 });
organizationSchema.index({ userId: 1, type: 1 });
organizationSchema.index({ userId: 1, favorites: 1 });

export default mongoose.model<IOrganization>('Organization', organizationSchema);
