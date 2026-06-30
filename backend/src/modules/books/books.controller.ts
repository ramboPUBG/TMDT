import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BooksService } from './books.service';
import { BookFilterDto } from './dto/book-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Delete, Patch } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookStatus } from './schemas/book.schema';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  async search(@Query() filterDto: BookFilterDto) {
    const result = await this.booksService.findAll({
      ...filterDto,
      limit: filterDto.limit ?? 8,
      page: 1,
    });
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Get()
  async findAll(@Query() filterDto: BookFilterDto) {
    return this.booksService.findAll(filterDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyBooks(
    @Query() filterDto: BookFilterDto,
    @CurrentUser('_id') userId: string,
  ) {
    const result = await this.booksService.findMyBooks(userId, filterDto);
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllForAdmin(@Query() filterDto: BookFilterDto) {
    const result = await this.booksService.findAllForAdmin(filterDto);
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookStatus,
  ) {
    const book = await this.booksService.updateStatus(id, status);
    return { success: true, data: book, message: 'Cập nhật trạng thái thành công' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.booksService.findOne(id),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.booksService.create(createBookDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @CurrentUser('_id') userId: string,
  ) {
    const book = await this.booksService.update(id, updateBookDto, userId);
    return { success: true, data: book };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
  ) {
    await this.booksService.remove(id, userId);
    return { success: true, message: 'Book deleted successfully' };
  }
}
