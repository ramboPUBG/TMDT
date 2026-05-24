import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { BooksService } from './books.service';
import { BookFilterDto } from './dto/book-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() filterDto: BookFilterDto) {
    return this.booksService.findAll(filterDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createBookDto: CreateBookDto, @Request() req: any) {
    // req.user is populated by JwtStrategy
    return this.booksService.create(createBookDto, req.user.userId);
  }
}
