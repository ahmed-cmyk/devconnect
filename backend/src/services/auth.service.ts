import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { User } from '../models/user.model';

export const registerUser = async (name: string, email: string, password: string) => {
  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });
  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return null;

  const token = generateToken(user._id.toString());
  return { user, token };
};
