import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateUserSettingsDto } from "./dto/CreateUserSettings.dto";
import { UsersSettingsService } from "./userSettings.service";
import mongoose from "mongoose";
import { UpdateUserSettingsDto } from "./dto/UpdateUserSettings.dto";


@Controller('users')
export class UsersSettingsController {
  constructor(private usersSettingsService: UsersSettingsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  createUserSettings(@Body() createUserSettingsDt0: CreateUserSettingsDto) {
    return this.usersSettingsService.create(createUserSettingsDt0);
  }

  // @Get(':userId')
  // async getByUserId(@Param('userId') id: string) {
  //   const isValid = mongoose.Types.ObjectId.isValid(id);
  //   if (!isValid) throw new HttpException('User not found', 404);
  //   const user = await this.usersSettingsService.getById(id);
  //   if (!user) throw new HttpException('User not found', 404);
  //   return user;
  // }

  
  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateUserSettings(@Param('id') id: string, @Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User settings id is not valid', 400);
    const updatedUserSettings = await this.usersSettingsService.update(id, updateUserSettingsDto);
    if (!updatedUserSettings) throw new HttpException('User settings not found', 404);
    return updatedUserSettings;
  }
}
