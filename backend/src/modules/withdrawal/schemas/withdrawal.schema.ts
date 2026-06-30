import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
export class BankInfo {
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountHolder: string;
}

@Schema({ timestamps: true, collection: 'withdrawals' })
export class Withdrawal {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ required: true, min: 1000 })
  amount: number;

  @Prop({ type: BankInfo, required: true })
  bankInfo: BankInfo;

  @Prop({ enum: WithdrawalStatus, default: WithdrawalStatus.PENDING, index: true })
  status: WithdrawalStatus;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
