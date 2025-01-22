import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserSettings } from '../../userSettings/schemas/userSettings.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ types: mongoose.Schema.Types.ObjectId, ref: "UserSettings" })
  settings?: UserSettings;
}

export const UserSchema = SchemaFactory.createForClass(User);
