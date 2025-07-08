import { Router } from 'express';
import { getUserById, getUsers, updateUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware'; // Assuming you have an auth middleware

const router = Router();

router.get('/', getUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);

export default router;
