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

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  addTransaction(
    @Body() createTransactionDTO: CreateTransactionDto,
  ) {
    return this.transactionsService.create(createTransactionDTO);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  updateTransaction(
    @Body() data: { id: string; date: string; quantityChange: number; pricePerUnit: number },
  ) {
    return this.transactionsService.update(data.id, data);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  removeTransaction(@Body() data: {id: string }) {
    return this.transactionsService.delete(data.id);
  }
}
