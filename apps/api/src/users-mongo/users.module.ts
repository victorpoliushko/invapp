// import { Module } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { User, UserSchema } from '../schemas/user.schema';
// import { UsersController } from './users.controller';
// import {
//   UserSettings,
//   UserSettingsSchema,
// } from '../schemas/userSettings.schema';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       {
//         name: User.name,
//         schema: UserSchema,
//       },
//       {
//         name: UserSettings.name,
//         schema: UserSettingsSchema,
//       },
//     ]),
//   ],
//   providers: [UsersService],
//   exports: [UsersService],
//   controllers: [UsersController],
// })
// export class UsersModule {}
