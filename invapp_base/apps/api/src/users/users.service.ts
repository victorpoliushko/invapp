import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdareUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name) private userSettingsModel: Model<UserSettings>,
  ) {}

  async findUserByName(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }

  async create({
    settings,
    ...createUserDto
  }: CreateUserDto): Promise<User> {
    if (settings) {
      console.log(`settings: ${JSON.stringify(settings)}`);
      const newSettings = new this.userSettingsModel(settings);
      const savedNewSettings = await newSettings.save();
      console.log(`savedNewSettings: ${savedNewSettings}`);
      const newUser = new this.userModel({
        ...createUserDto,
        settings: {
          _id: savedNewSettings.id,
          ...settings
        }
      });
      console.log(`newUser: ${newUser}`);
      return newUser.save();
    }
    const userCreated = new this.userModel(createUserDto);
    return userCreated.save();
  }

  find(): Promise<User[]> {
    return this.userModel.find().populate(['settings', 'investStrategies']);
  }

  getById(id: string): Promise<User> {
    return this.userModel.findById(id).populate('settings');
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
