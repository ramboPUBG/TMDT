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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
