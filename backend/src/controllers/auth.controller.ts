import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await AuthService.registerUser(name, email, password);
    res.status(201).json(user);
  } catch (err) {
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
