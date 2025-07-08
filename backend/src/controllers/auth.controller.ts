import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await AuthService.registerUser(name, email, password);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'User already exists') {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.authenticateUser(email, password);

  if (!result) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ user: result.user, token: result.token });
};
