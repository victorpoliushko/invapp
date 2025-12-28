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
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getTransations() {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addTransation(
    @Body() createTransactionDTO: CreateTransactionDto
  ) {
    return this.transactionsService.create(createTransactionDTO);
  }
}
