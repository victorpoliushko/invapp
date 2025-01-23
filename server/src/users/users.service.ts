import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdareUser.dto';
import { CreateUserSettingsDto } from 'src/userSettings/dto/CreateUserSettings.dto';
import { UserSettings } from 'src/userSettings/schemas/userSettings.schema';

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
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name) private userSettingsModel: Model<UserSettings>,
  ) {}

  async findUserByName(username: string): Promise<MockUser | undefined> {
    return users.find((user) => user.username === username);
  }

  async create({
    settings,
    ...createUserDto
  }: CreateUserDto): Promise<User> {
    if (settings) {
      console.log(`settings: ${JSON.stringify(settings)}`);
      const newSettings = new this.userSettingsModel(settings);
      console.log(`newSewttings: ${newSettings}`);
      const savedNewSettings = await newSettings.save();
      console.log(`savedNewSettings: ${savedNewSettings}`);
      const newUser = new this.userModel({
        ...createUserDto,
        settings: { ...savedNewSettings }
      });
      console.log(`newUser: ${newUser}`);
      return newUser.save();
    }
    const userCreated = new this.userModel(createUserDto);
    return userCreated.save();
  }

  find(): Promise<User[]> {
    return this.userModel.find();
  }

  getById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
