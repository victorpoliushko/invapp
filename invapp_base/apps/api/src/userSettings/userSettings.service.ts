// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// // import { UserSettings } from '../schemas/userSettings.schema';
// import { CreateUserSettingsDto } from './dto/CreateUserSettings.dto';
// import { UpdateUserSettingsDto } from './dto/UpdateUserSettings.dto';


// @Injectable()
// export class UsersSettingsService {
//   constructor(@InjectModel(UserSettings.name) private userSettingsModel: Model<UserSettings>) {}

//   create(createUserSettingsDto: CreateUserSettingsDto): Promise<UserSettings> {
//     const userSettingsCreated = new this.userSettingsModel(createUserSettingsDto);
//     return userSettingsCreated.save();
//   }

//   // getByUserId(userId: string): Promise<UserSettings> {
//   //   return this.userSettingsModel.findById(userId);
//   // }

//   update(id: string, updateUserSettingsDto: UpdateUserSettingsDto): Promise<UserSettings> {
//     return this.userSettingsModel.findByIdAndUpdate(id, updateUserSettingsDto, { new: true });
//   }
// }
