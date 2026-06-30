import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryResponse {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'sachcu',
  ): Promise<CloudinaryResponse> {
    // Return mock URL if Cloudinary is not configured
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your-api-key') {
      return {
        url: `https://placehold.co/600x400?text=Mock+Image+${Date.now()}`,
        publicId: `mock-id-${Date.now()}`
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
          transformation: [{ width: 1000, crop: 'limit' }], // Resize to max 1000px width
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException('Lỗi khi upload ảnh lên Cloudinary'),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'sachcu',
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    if (files.length > 6) {
      throw new BadRequestException('Chỉ được phép tải lên tối đa 6 ảnh');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      throw new BadRequestException('Lỗi khi xóa ảnh trên Cloudinary');
    }
  }
}
