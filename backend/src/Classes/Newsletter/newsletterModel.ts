import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date | null;
}

const newsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz'],
    maxlength: 254
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

newsletterSchema.index({ email: 1 });

newsletterSchema.index({ isActive: 1, subscribedAt: -1 });

const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter; 