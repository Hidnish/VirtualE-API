import { Router } from 'express'
import { getChannel, getChannels, addChannel, editChannelName, deleteChannel } from '../controllers/channel.controller.js';
const router = Router();

router.get('/getChannels', getChannels);
router.get('/getChannel/:channelId', getChannel);
router.post('/addChannel', addChannel);
router.patch('/editChannelName/:channelId', editChannelName);
router.delete('/deleteChannel/:channelId', deleteChannel);

export default router;