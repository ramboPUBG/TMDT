import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true, index: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
  orderId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes for query optimization
ReviewSchema.index({ bookId: 1, createdAt: -1 });
ReviewSchema.index({ sellerId: 1, createdAt: -1 });
ReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
