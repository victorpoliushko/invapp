import { Injectable } from '@nestjs/common';

export type User = {
  userId: string;
  username: string;
  password: string;
};

const users = [
  {
    userId: '123',
    username: 'viktor',
    password: '123',
  },
  {
    userId: '1234',
    username: 'viktor2',
    password: '1234',
  },
];

@Injectable()
export class UsersService {
  async findUserByName(username: string): Promise<User | undefined> {
    return users.find(user => user.username === username);
  }
}
