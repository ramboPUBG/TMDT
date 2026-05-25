import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';
import { Address, AddressDocument } from './schemas/address.schema';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  // ========== USER CRUD ==========

  async create(data: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const user = new this.userModel(data);
    return user.save();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password +refreshToken');
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId });
  }

  async updateProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, data, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, 12)
      : null;
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordOtp: null,
      resetPasswordExpires: null,
    });
  }

  async setResetPasswordOtp(
    userId: string,
    otp: string,
    expires: Date,
  ): Promise<void> {
    const hashedOtp = await bcrypt.hash(otp, 12);
    await this.userModel.findByIdAndUpdate(userId, {
      resetPasswordOtp: hashedOtp,
      resetPasswordExpires: expires,
    });
  }

  async findByResetOtp(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+resetPasswordOtp +resetPasswordExpires');
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }

  // ========== SELLER PROFILE ==========

  async upgradeToSeller(
    userId: string,
    shopName: string,
    description?: string,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        role: UserRole.SELLER,
        sellerProfile: {
          shopName,
          description: description || '',
          rating: 0,
          totalReviews: 0,
          totalSold: 0,
          isVerified: false,
        },
      },
      { new: true },
    ) as Promise<UserDocument>;
  }

  async getSellerProfile(sellerId: string): Promise<UserDocument> {
    const seller = await this.userModel.findOne({
      _id: sellerId,
      role: { $in: [UserRole.SELLER, UserRole.ADMIN] },
    });
    if (!seller) {
      throw new NotFoundException('Không tìm thấy người bán');
    }
    return seller;
  }

  // ========== ADMIN ==========

  async findAll(
    page: number = 1,
    limit: number = 20,
    role?: string,
    status?: string,
    keyword?: string,
  ): Promise<PaginatedResult<UserDocument>> {
    const filter: Record<string, unknown> = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (keyword) {
      filter.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async lockUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.LOCKED },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async unlockUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.ACTIVE },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  // ========== ADDRESSES ==========

  async getAddresses(userId: string): Promise<AddressDocument[]> {
    return this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
  }

  async createAddress(
    userId: string,
    data: Partial<Address>,
  ): Promise<AddressDocument> {
    // If this is the first address or set as default, reset others
    if (data.isDefault) {
      await this.addressModel.updateMany({ userId }, { isDefault: false });
    }

    const addressCount = await this.addressModel.countDocuments({ userId });
    if (addressCount === 0) {
      data.isDefault = true;
    }

    const address = new this.addressModel({ ...data, userId });
    return address.save();
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<Address>,
  ): Promise<AddressDocument> {
    if (data.isDefault) {
      await this.addressModel.updateMany({ userId }, { isDefault: false });
    }

    const address = await this.addressModel.findOneAndUpdate(
      { _id: addressId, userId },
      data,
      { new: true },
    );
    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }
    return address;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const result = await this.addressModel.findOneAndDelete({
      _id: addressId,
      userId,
    });
    if (!result) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }
  }
}
