import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser, IAddress } from '../../types';

const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true,
    default: 'home'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  address1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  address2: {
    type: String,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    default: 'Türkiye'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]+$/, 'Geçerli bir telefon numarası giriniz']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz'],
    maxlength: 254
  },
  password: {
    type: String,
    required: [true, 'Parola gereklidir'],
    minlength: [6, 'Parola en az 6 karakter olmalıdır'],
    select: false 
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    required: true
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'Ad gereklidir'],
      trim: true,
      maxlength: [50, 'Ad 50 karakterden fazla olamaz']
    },
    lastName: {
      type: String,
      required: [true, 'Soyad gereklidir'],
      trim: true,
      maxlength: [50, 'Soyad 50 karakterden fazla olamaz']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-\(\)]+$/, 'Geçerli bir telefon numarası giriniz']
    }
  },
  addresses: {
    type: [addressSchema],
    default: []
  },
  preferences: {
    favoriteCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    favoriteProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  authentication: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.virtual('isLocked').get(function(this: IUser) {
  return this.authentication.lockUntil ? this.authentication.lockUntil > new Date() : false;
});

userSchema.virtual('defaultAddress').get(function(this: IUser) {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      this.addresses.forEach((addr, index) => {
        if (index > 0 && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.authentication.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.authentication.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // bir gün
  return token;
};

userSchema.methods.createPasswordResetToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.authentication.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.authentication.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // on dakika
  return token;
};

userSchema.methods.increaseLoginAttempts = function(): Promise<void> {
  if (this.authentication.lockUntil && this.authentication.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { 'authentication.lockUntil': 1 },
      $set: { 'authentication.loginAttempts': 1 }
    });
  }
  
  const updates: any = { $inc: { 'authentication.loginAttempts': 1 } };
  
  if (this.authentication.loginAttempts + 1 >= 5 && !this.authentication.lockUntil) {
    updates.$set = { 'authentication.lockUntil': new Date(Date.now() + 2 * 60 * 60 * 1000) }; // iki saat
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function(): Promise<void> {
  return this.updateOne({
    $unset: { 
      'authentication.loginAttempts': 1, 
      'authentication.lockUntil': 1 
    }
  });
};

userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: 'customer' | 'admin') {
  return this.find({ role, isActive: true });
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User; 