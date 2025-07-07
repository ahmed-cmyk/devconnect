import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
  channels: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }]
});

export const User = mongoose.model<IUser>('User', UserSchema);
