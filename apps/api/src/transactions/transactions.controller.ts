import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/CreateTransaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {
    console.log('transaction controller');
  }

  // @Get()
  // @UseGuards(AuthGuard('jwt'))
  // @UsePipes(new ValidationPipe())
  // getTransactions() {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addTransaction(
    // @Body() createTransactionDTO: any
    @Body() createTransactionDTO: CreateTransactionDto,
  ) {
    return this.transactionsService.create(createTransactionDTO);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  removeTransaction(@Body() data: {id: string }) {
    return this.transactionsService.delete(data.id);
  }
}
