import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ========== REGISTER ==========

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      password: dto.password,
      fullName: dto.fullName,
      phone: dto.phone,
      role: UserRole.BUYER,
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ========== LOGIN ==========

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status === 'locked') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ========== GOOGLE AUTH ==========

  async googleAuth(googleToken: string) {
    // Verify Google token using Google API
    const googlePayload = await this.verifyGoogleToken(googleToken);

    if (!googlePayload) {
      throw new UnauthorizedException('Token Google không hợp lệ');
    }

    let user = await this.usersService.findByGoogleId(googlePayload.sub);

    if (!user) {
      // Check if email already exists
      user = await this.usersService.findByEmail(googlePayload.email);

      if (user) {
        // Link Google account to existing user
        await this.usersService.updateProfile(user._id.toString(), {
          googleId: googlePayload.sub,
          avatar: user.avatar || googlePayload.picture,
        });
        user = await this.usersService.findById(user._id.toString());
      } else {
        // Create new user
        user = await this.usersService.create({
          email: googlePayload.email,
          fullName: googlePayload.name,
          avatar: googlePayload.picture,
          googleId: googlePayload.sub,
          role: UserRole.BUYER,
        });
      }
    }

    if (user.status === 'locked') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ========== LOGOUT ==========

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // ========== REFRESH TOKEN ==========

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const isTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isTokenValid) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const tokens = await this.generateTokens(user);
      await this.usersService.updateRefreshToken(
        user._id.toString(),
        tokens.refreshToken,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Token hết hạn, vui lòng đăng nhập lại');
    }
  }

  // ========== FORGOT PASSWORD ==========

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Nếu email tồn tại, OTP đã được gửi' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setResetPasswordOtp(
      user._id.toString(),
      otp,
      expires,
    );

    // TODO: Send OTP via email using Nodemailer
    console.log(`[DEV] OTP for ${dto.email}: ${otp}`);

    return { message: 'Nếu email tồn tại, OTP đã được gửi' };
  }

  // ========== RESET PASSWORD ==========

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetOtp(dto.email);

    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    const isOtpValid = await bcrypt.compare(dto.otp, user.resetPasswordOtp);
    if (!isOtpValid) {
      throw new BadRequestException('OTP không đúng');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(user._id.toString(), hashedPassword);

    return { message: 'Đã đặt lại mật khẩu thành công' };
  }

  // ========== CHANGE PASSWORD ==========

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId)).email,
    );

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Đã đổi mật khẩu thành công' };
  }

  // ========== HELPERS ==========

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'secret',
        expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'secret',
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.resetPasswordOtp;
    delete obj.resetPasswordExpires;
    return obj;
  }

  private async verifyGoogleToken(token: string): Promise<{
    sub: string;
    email: string;
    name: string;
    picture: string;
  } | null> {
    try {
      // Use Google's tokeninfo endpoint for verification
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );
      if (!response.ok) return null;

      const payload = await response.json();
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

      if (payload.aud !== clientId) return null;

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch {
      return null;
    }
  }
}
