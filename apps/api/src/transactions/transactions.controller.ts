import {
  Body,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { GetUser } from 'src/auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';

export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getTransations() {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addTransation(
    @Body() createTransactionDTO: CreateTransactionDto,
    @GetUser() user: User,
  ) {}
}
