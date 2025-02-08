import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { CreateUserDto } from "./dto/CreateUser.dto";

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
    return await this.prismaService.user.findUniqueOrThrow({ where: { id }});
  }

  async getUserByName(username: string): Promise<User> {
    return await this.prismaService.user.findUniqueOrThrow({ where: { username }});
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.prismaService.user.create({ data: user });
  }
}
