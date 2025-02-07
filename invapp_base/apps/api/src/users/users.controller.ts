import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }
}
