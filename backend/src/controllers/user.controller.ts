import { Request, Response } from 'express';
import { User } from '../models/user.model';

interface AuthRequest extends Request {
  userId?: string;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Ensure that the user can only access their own profile or if they are an admin
    if (req.userId !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Ensure that the user can only update their own profile
    if (req.userId !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Input validation for update
    if (!name && !email) {
      return res.status(400).json({ message: 'At least one field (name or email) is required for update' });
    }

    if (email) {
      const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
