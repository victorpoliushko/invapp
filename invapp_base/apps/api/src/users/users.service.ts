import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { omit } from '../helpers/omit';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UserDto } from './dto/User.dto';
import { plainToInstance } from 'class-transformer';

// interface IUser {
//   id: string;
//   login: string;
//   password    String
//   phoneNumber String?
// }

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUser(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    return plainToInstance(UserDto, user);
  }

  async getUserByName(username: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });
    return plainToInstance(UserDto, user);
  }

  async create(input: CreateUserDto): Promise<UserDto> {
    const { username, password, phoneNumber } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prismaService.user.create({
      data: {
        username,
        phoneNumber,
        password: hashedPassword,
      },
    });

    return plainToInstance(UserDto, createdUser);
  }

  async update(id: string, input: UpdateUserDto): Promise<UserDto> {
    const user = this.prismaService.user.update({
      where: {
        id
      },
      data: {
        phoneNumber: input.phoneNumber
      }
    });

    return plainToInstance(UserDto, user);
  }
}
