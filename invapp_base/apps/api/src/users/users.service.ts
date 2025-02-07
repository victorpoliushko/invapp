import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

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
}
