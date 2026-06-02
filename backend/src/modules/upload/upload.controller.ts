import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }
    const result = await this.uploadService.uploadImage(file);
    return { success: true, data: result, message: 'Upload ảnh thành công' };
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 6, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một file');
    }
    const result = await this.uploadService.uploadMultipleImages(files);
    return {
      success: true,
      data: result,
      message: 'Upload các ảnh thành công',
    };
  }

  @Delete('image')
  async deleteImage(@Query('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Vui lòng cung cấp publicId');
    }
    await this.uploadService.deleteImage(publicId);
    return { success: true, message: 'Đã xóa ảnh' };
  }
}
