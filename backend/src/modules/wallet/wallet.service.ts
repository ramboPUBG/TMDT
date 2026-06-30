import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async getWallet(userId: string): Promise<WalletDocument> {
    const userObjectId = new Types.ObjectId(userId);
    let wallet = await this.walletModel.findOne({ userId: userObjectId });
    if (!wallet) {
      wallet = await this.walletModel.create({
        userId: userObjectId,
        balance: 0,
      });
    }
    return wallet;
  }

  async addFunds(userId: string, amount: number): Promise<WalletDocument> {
    if (amount <= 0) return this.getWallet(userId);
    
    const userObjectId = new Types.ObjectId(userId);
    let wallet = await this.walletModel.findOne({ userId: userObjectId });
    if (!wallet) {
      wallet = await this.walletModel.create({
        userId: userObjectId,
        balance: amount,
      });
    } else {
      wallet.balance += amount;
      await wallet.save();
    }
    return wallet;
  }

  async deductFunds(userId: string, amount: number): Promise<WalletDocument> {
    const wallet = await this.getWallet(userId);
    if (wallet.balance < amount) {
      throw new Error('Số dư ví không đủ để thực hiện giao dịch');
    }
    wallet.balance -= amount;
    return wallet.save();
  }
}
