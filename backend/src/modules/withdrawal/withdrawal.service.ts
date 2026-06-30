import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Withdrawal, WithdrawalDocument, WithdrawalStatus } from './schemas/withdrawal.schema';
import { WalletService } from '../wallet/wallet.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    private readonly walletService: WalletService,
  ) {}

  async createRequest(sellerId: string, dto: CreateWithdrawalDto): Promise<WithdrawalDocument> {
    const sellerObjectId = new Types.ObjectId(sellerId);
    
    // Check wallet and deduct
    try {
      await this.walletService.deductFunds(sellerId, dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const request = new this.withdrawalModel({
      sellerId: sellerObjectId,
      amount: dto.amount,
      bankInfo: {
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountHolder: dto.accountHolder,
      },
      status: WithdrawalStatus.PENDING,
    });

    return request.save();
  }

  async getMyRequests(sellerId: string): Promise<WithdrawalDocument[]> {
    return this.withdrawalModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllRequestsForAdmin(): Promise<WithdrawalDocument[]> {
    return this.withdrawalModel
      .find()
      .populate('sellerId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatusByAdmin(id: string, status: WithdrawalStatus): Promise<WithdrawalDocument> {
    const request = await this.withdrawalModel.findById(id);
    if (!request) {
      throw new NotFoundException('Yêu cầu rút tiền không tồn tại');
    }

    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể cập nhật yêu cầu ở trạng thái Chờ duyệt');
    }

    if (status === WithdrawalStatus.REJECTED) {
      // Refund to seller's wallet
      await this.walletService.addFunds(request.sellerId.toString(), request.amount);
    }

    request.status = status;
    return request.save();
  }
}
