import { Router } from 'express'
import {
  getChannel,
  getChannels,
  addChannel,
  editChannelName,
  deleteChannel,
} from '../controllers/channel.controller.js'
import { verifyTokenTest } from '../middlewares/authJwt.js'
const router = Router()

router.get('/getChannels', getChannels)
router.get('/getChannel/:channelId', getChannel)
router.post('/addChannel', verifyTokenTest, addChannel) // Middleware added to verify user via jwt
router.patch('/editChannelName/:channelId', verifyTokenTest, editChannelName)
router.delete('/deleteChannel/:channelId', verifyTokenTest, deleteChannel)

export default router
