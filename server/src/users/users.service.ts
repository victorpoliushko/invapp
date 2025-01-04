import { Injectable } from '@nestjs/common';

export type User = {
  userId: string;
  userName: string;
  password: string;
};

const users = [
  {
    userId: '123',
    userName: 'viktor',
    password: '123',
  },
  {
    userId: '1234',
    userName: 'viktor2',
    password: '1234',
  },
];

@Injectable()
export class UsersService {
  async findUserByName(username: string): Promise<User | undefined> {
    return users.find(user => user.userName === username);
  }
}
