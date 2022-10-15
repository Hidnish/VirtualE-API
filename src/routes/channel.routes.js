import { Router } from 'express';
import { verifyTokenTest } from '../middlewares/authJwt.js';
import {
  getChannel,
  getChannels,
  addChannel,
  editChannelName,
  deleteChannel,
  subscribeChannel,
  unSubscribeChannel,
  getUserChannels,
} from '../controllers/channel.controller.js';

const router = Router();

router.get('/getChannels', getChannels);
router.get('/getChannel/:channelId', getChannel);
router.post('/addChannel', verifyTokenTest, addChannel);
router.patch('/editChannelName/:channelId', verifyTokenTest, editChannelName);
router.delete('/deleteChannel/:channelId', verifyTokenTest, deleteChannel);
router.post('/subscribeChannel/:channelId', verifyTokenTest, subscribeChannel);
router.get('/subscribedChannels', verifyTokenTest, getUserChannels);
router.delete(
  '/unSubscribeChannel/:channelId',
  verifyTokenTest,
  unSubscribeChannel
);

export default router;
