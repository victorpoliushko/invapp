// monogDB implementation

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument } from 'mongoose';
// import { UserSettings } from './userSettings.schema';
// import { InvestStrategy } from './investSrategy.schema';

// export type UserDocument = HydratedDocument<User>;

// @Schema()
// export class User {
//   @Prop({ required: true, unique: true })
//   username: string;

//   @Prop({ required: true })
//   password: string;

//   @Prop()
//   phoneNumber?: string;

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserSettings.name })
//   settings?: UserSettings;

//   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: InvestStrategy.name}] })
//   investStrategies: InvestStrategy[];
// }

// export const UserSchema = SchemaFactory.createForClass(User);
