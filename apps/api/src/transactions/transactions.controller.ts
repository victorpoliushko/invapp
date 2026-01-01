import {
  Body,
  Controller,
  Get,
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
    @Body() createTransactionDTO: CreateTransactionDto
  ) {
    console.log(`
     add transaction 
    `);
    return this.transactionsService.create(createTransactionDTO);
  }
}
