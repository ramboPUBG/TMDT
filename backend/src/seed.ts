import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './modules/users/schemas/user.schema';
import { Category } from './modules/categories/schemas/category.schema';
import {
  Book,
  BookCondition,
  BookStatus,
} from './modules/books/schemas/book.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const bookModel = app.get<Model<Book>>(getModelToken(Book.name));

  console.log('Clearing existing data and indexes...');
  try {
    await bookModel.collection.dropIndex('book_text_search');
  } catch (e) {
    // ignore if index doesn't exist
  }
  await userModel.deleteMany({});
  await categoryModel.deleteMany({});
  await bookModel.deleteMany({});

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('123456', salt);

  const seller1 = await userModel.create({
    fullName: 'Tiệm sách cũ Cô Ba',
    email: 'coba@gmail.com',
    password: hashedPassword,
    role: UserRole.SELLER,
    sellerProfile: {
      shopName: 'Tiệm sách cũ Cô Ba',
      rating: 4.8,
      totalReviews: 120,
      totalSold: 450,
      isVerified: true,
    },
  });

  const seller2 = await userModel.create({
    fullName: 'Mọt Sách SG',
    email: 'motsach@gmail.com',
    password: hashedPassword,
    role: UserRole.SELLER,
    sellerProfile: {
      shopName: 'Mọt Sách SG',
      rating: 4.5,
      totalReviews: 85,
      totalSold: 300,
      isVerified: true,
    },
  });

  const buyer = await userModel.create({
    fullName: 'Nguyễn Văn A (Người mua)',
    email: 'buyer@gmail.com',
    password: hashedPassword,
    role: UserRole.BUYER,
  });

  console.log('Seeding Categories...');
  const catVanHoc = await categoryModel.create({
    name: 'Văn học',
    slug: 'van-hoc',
    icon: '📑',
  });
  const catKinhTe = await categoryModel.create({
    name: 'Kinh tế',
    slug: 'kinh-te',
    icon: '💰',
  });
  const catTamLy = await categoryModel.create({
    name: 'Tâm lý - Kỹ năng',
    slug: 'tam-ly-ky-nang',
    icon: '✨',
  });
  const catThieuNhi = await categoryModel.create({
    name: 'Sách thiếu nhi',
    slug: 'sach-thieu-nhi',
    icon: '👶',
  });

  console.log('Seeding Books...');
  await bookModel.create([
    {
      title: '📚 ĐÔI CÁNH - Tuyển tập truyện ngắn Nga đương đại',
      author: 'Nhiều tác giả',
      publisher: 'NXB Kim Đồng',
      categoryId: catVanHoc._id,
      sellerId: seller1._id,
      sellingPrice: 550000,
      originalPrice: 700000,
      quantity: 1,
      condition: BookCondition.LIKE_NEW,
      status: BookStatus.APPROVED,
      slug: 'doi-canh-tuyen-tap-truyen-ngan-nga-' + Date.now(),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
          isMain: true,
        },
      ],
      description:
        'Moscow Edition hiếm sưu tầm bìa cứng. Còn rất mới không bị nhăn mép.',
    },
    {
      title: 'Sapiens: Lược sử loài người',
      author: 'Yuval Noah Harari',
      publisher: 'NXB Tri Thức',
      categoryId: catKinhTe._id,
      sellerId: seller2._id,
      sellingPrice: 120000,
      originalPrice: 195000,
      quantity: 1,
      condition: BookCondition.GOOD,
      status: BookStatus.APPROVED,
      slug: 'sapiens-luoc-su-loai-nguoi-' + Date.now(),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500',
          isMain: true,
        },
      ],
      description: 'Sách hay về lịch sử loài người. Mua đọc 1 lần cất tủ.',
    },
    {
      title: 'Đắc Nhân Tâm',
      author: 'Dale Carnegie',
      publisher: 'NXB Tổng hợp TP.HCM',
      categoryId: catTamLy._id,
      sellerId: seller1._id,
      sellingPrice: 35000,
      originalPrice: 86000,
      quantity: 1,
      condition: BookCondition.FAIR,
      status: BookStatus.APPROVED,
      slug: 'dac-nhan-tam-' + Date.now(),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
          isMain: true,
        },
      ],
      description: 'Bìa hơi cũ nhưng chữ rõ nét, không rách trang nào.',
    },
    {
      title: 'Harry Potter và Hòn Đá Phù Thủy',
      author: 'J.K. Rowling',
      publisher: 'NXB Trẻ',
      categoryId: catThieuNhi._id,
      sellerId: seller2._id,
      sellingPrice: 60000,
      originalPrice: 130000,
      quantity: 1,
      condition: BookCondition.GOOD,
      status: BookStatus.APPROVED,
      slug: 'harry-potter-1-' + Date.now(),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=500',
          isMain: true,
        },
      ],
      description: 'Bản dịch cũ của Lý Lan, giữ gìn rất cẩn thận.',
    },
    {
      title: 'Nhà Lãnh Đạo Không Chức Danh',
      author: 'Robin Sharma',
      publisher: 'NXB Trẻ',
      categoryId: catTamLy._id,
      sellerId: seller1._id,
      sellingPrice: 45000,
      originalPrice: 90000,
      quantity: 1,
      condition: BookCondition.GOOD,
      status: BookStatus.APPROVED,
      slug: 'nha-lanh-dao-khong-chuc-danh-' + Date.now(),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1587876878363-22879586146c?w=500',
          isMain: true,
        },
      ],
      description: 'Sách hay về kỹ năng sống, đáng đọc.',
    },
  ]);

  console.log('Seeding Done!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts:');
  console.log('Seller 1 : coba@gmail.com / 123456');
  console.log('Seller 2 : motsach@gmail.com / 123456');
  console.log('Buyer    : buyer@gmail.com / 123456');
  console.log('----------------------------------------------------');

  await app.close();
  process.exit(0);
}

bootstrap();
