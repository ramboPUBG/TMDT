import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './src/modules/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const email = 'admin@gmail.com';
  const existing = await userModel.findOne({ email });
  
  if (existing) {
    console.log('Admin account already exists:', email);
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('123456', salt);

    await userModel.create({
      fullName: 'Quản trị viên',
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    console.log('Admin account created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
  }

  await app.close();
  process.exit(0);
}

void createAdmin();
