import { Request, Response, NextFunction } from 'express';
import { channel as Channel } from '../models/channel.model';

export const isChannelAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  const channelId = req.params.id;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    return res.status(404).json({ message: 'Channel not found' });
  }

  if (!channel.admins.map(String).includes(userId)) {
    return res.status(403).json({ message: 'You are not an admin of this channel' });
  }

  (req as any).channel = channel;

  next();
};
