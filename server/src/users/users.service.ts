import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

export type MockUser = {
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
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUserByName(username: string): Promise<User | undefined> {
    return users.find(user => user.username === username);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userCreated = new this.userModel(createUserDto);
    return userCreated.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }
}
