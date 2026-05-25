import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { BooksService } from './books.service';
import { BookFilterDto } from './dto/book-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() filterDto: BookFilterDto) {
    console.log('BooksController.findAll received filterDto:', filterDto);
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
  async create(@Body() createBookDto: CreateBookDto, @Request() req: any) {
    // req.user is populated by JwtStrategy
    return this.booksService.create(createBookDto, req.user.userId);
  }
}
