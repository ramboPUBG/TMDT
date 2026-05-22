import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  INSPECTOR = 'inspector',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  PENDING = 'pending',
}

@Schema({ _id: false })
export class BankAccount {
  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountHolder: string;
}

@Schema({ _id: false })
export class SellerProfile {
  @Prop({ default: '' })
  shopName: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 0 })
  totalSold: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: BankAccount })
  bankAccount: BankAccount;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ sparse: true, trim: true })
  phone: string;

  @Prop({ select: false })
  password: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop()
  googleId: string;

  @Prop({ type: SellerProfile })
  sellerProfile: SellerProfile;

  @Prop({ select: false })
  refreshToken: string;

  @Prop({ select: false })
  resetPasswordOtp: string;

  @Prop({ select: false })
  resetPasswordExpires: Date;

  @Prop()
  lastLoginAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ googleId: 1 });
