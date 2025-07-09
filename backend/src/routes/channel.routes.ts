import { Router } from 'express';
import { getChannels, getChannelById, createChannel, updateChannel, deleteChannel } from '../controllers/channel.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { isChannelAdmin } from '../middleware/channel.middleware';

const router = Router();

router
  .route('/')
  .get(authMiddleware, getChannels)
  .post(authMiddleware, createChannel);

router
  .route('/:id')
  .get(authMiddleware, getChannelById)
  .put(authMiddleware, isChannelAdmin, updateChannel)
  .delete(authMiddleware, isChannelAdmin, deleteChannel);

export default router;
