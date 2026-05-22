import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return { success: true, data: categories };
  }

  @Get('tree')
  async getTree() {
    const tree = await this.categoriesService.getTree();
    return { success: true, data: tree };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return { success: true, data: category };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() data: Partial<any>) {
    const category = await this.categoriesService.create(data);
    return { success: true, data: category, message: 'Đã tạo danh mục' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<any>) {
    const category = await this.categoriesService.update(id, data);
    return { success: true, data: category, message: 'Đã cập nhật danh mục' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return { success: true, message: 'Đã xóa danh mục' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('seed')
  async seed() {
    await this.categoriesService.seed();
    return { success: true, message: 'Đã seed danh mục' };
  }
}
