import { Request, Response } from 'express';
import { channel as Channel } from '../models/channel.model';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await Channel.find();
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (channel == null) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as any).userId; // Assuming user ID is attached by authMiddleware

    if (!name) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const channel = await Channel.create({
      name,
      description,
      members: [userId],
      admins: [userId],
    });
    res.status(201).json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = (req as any).userId; // Assuming user ID is attached by authMiddleware

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if the user is an admin of the channel
    if (!channel.admins.includes(userId)) {
      return res.status(403).json({ message: 'Forbidden: You are not an admin of this channel' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    res.status(200).json(updatedChannel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId; // Assuming user ID is attached by authMiddleware

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if the user is an admin of the channel
    if (!channel.admins.includes(userId)) {
      return res.status(403).json({ message: 'Forbidden: You are not an admin of this channel' });
    }

    await Channel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
