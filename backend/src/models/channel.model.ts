import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
}

const ChannelSchema = new Schema<IChannel> ({
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const channel = mongoose.model<IChannel>('Channel', ChannelSchema);
