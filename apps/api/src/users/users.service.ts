import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UserDto } from './dto/User.dto';
import { plainToInstance } from 'class-transformer';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';


@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUser(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { portfolios: true },
    });
    if (!user) {
      throw new HttpException(getReasonPhrase(StatusCodes.NOT_FOUND), StatusCodes.NOT_FOUND);
    }
    return plainToInstance(UserDto, user);
  }

  async getUserByName(username: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<UserDto> {
    const foundUser = await this.prismaService.user.findFirst({ where: { email } });
    return plainToInstance(UserDto, foundUser)
  }

  async create(input: CreateUserDto): Promise<UserDto> {
    const { username, password, email, phoneNumber } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prismaService.user.create({
      data: {
        username,
        phoneNumber,
        email,
        password: hashedPassword,
      },
    });

    return plainToInstance(UserDto, createdUser);
  }

  async update(id: string, input: UpdateUserDto): Promise<UserDto> {
    const user = this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        phoneNumber: input.phoneNumber,
      },
    });

    return plainToInstance(UserDto, user);
  }
}
