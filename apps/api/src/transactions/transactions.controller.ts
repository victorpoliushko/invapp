import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';
import { GetUser } from '../auth/decorators/GetUser.decorator';
import { User } from '@prisma/client';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addTransaction(
    @Body() createTransactionDTO: CreateTransactionDto,
    @GetUser() user: User,
  ) {
    return this.transactionsService.create(createTransactionDTO, user.id);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  updateTransaction(
    @Body() data: { id: string; date: string; quantityChange: number; pricePerUnit: number },
    @GetUser() user: User,
  ) {
    return this.transactionsService.update(data.id, data, user.id);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  removeTransaction(@Body() data: { id: string }, @GetUser() user: User) {
    return this.transactionsService.delete(data.id, user.id);
  }
}
