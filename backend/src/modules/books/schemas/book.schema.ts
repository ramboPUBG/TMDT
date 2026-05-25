import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

export enum BookCondition {
  LIKE_NEW = 'like_new', // Như mới (>90%)
  GOOD = 'good', // Tốt (70-90%)
  FAIR = 'fair', // Khá (50-70%)
  WORN = 'worn', // Cũ (<50%)
}

export enum BookStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
  HIDDEN = 'hidden',
}

@Schema({ _id: false })
export class BookImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  publicId: string;

  @Prop({ default: false })
  isMain: boolean;
}

@Schema({ timestamps: true, collection: 'books' })
export class Book {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  // Book info
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ trim: true })
  publisher: string;

  @Prop()
  publishYear: number;

  @Prop({ sparse: true })
  isbn: string;

  @Prop({ default: 'vi' })
  language: string;

  @Prop()
  numberOfPages: number;

  // Pricing
  @Prop()
  originalPrice: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ default: 1 })
  quantity: number;

  // Condition
  @Prop({ enum: BookCondition, required: true })
  condition: BookCondition;

  @Prop()
  conditionDescription: string;

  // Media
  @Prop({ type: [BookImage], default: [] })
  images: BookImage[];

  @Prop()
  description: string;

  // Status
  @Prop({ enum: BookStatus, default: BookStatus.PENDING, index: true })
  status: BookStatus;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  // Search & SEO
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ unique: true })
  slug: string;

  // Analytics
  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

  // Shipping
  @Prop()
  weight: number;

  @Prop({ default: false })
  freeShipping: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Indexes
BookSchema.index({ sellerId: 1, status: 1 });
BookSchema.index({ categoryId: 1, status: 1 });
BookSchema.index({ status: 1, createdAt: -1 });
BookSchema.index(
  { title: 'text', author: 'text', description: 'text', tags: 'text' },
  {
    weights: { title: 10, author: 5, tags: 3, description: 1 },
    name: 'book_text_search',
    default_language: 'none',
    language_override: 'dummy_language',
  },
);
BookSchema.index({ sellingPrice: 1 });
BookSchema.index({ condition: 1 });
