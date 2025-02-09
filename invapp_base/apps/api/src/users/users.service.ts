import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { omit } from '../helpers/omit';

// interface IUser {
//   id: string;
//   login: string;
//   password    String
//   phoneNumber String?
// }

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUser(id: string): Promise<User> {
    return await this.prismaService.user.findUniqueOrThrow({ where: { id } });
  }

  async getUserByName(username: string): Promise<User> {
    return await this.prismaService.user.findUniqueOrThrow({
      where: { username },
    });
  }

  async create(input: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, password, phoneNumber } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prismaService.user.create({
      data: {
        username,
        phoneNumber,
        password: hashedPassword,
      },
    });

    return omit(createdUser, 'password');
  }
}
