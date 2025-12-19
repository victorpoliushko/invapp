import { Get, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { AuthGuard } from "@nestjs/passport";

export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  getTransations() {
    
  }
};

