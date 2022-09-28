import { Router } from 'express';
import {
  getUsers,
  register,
  getUser,
  deleteUser,
  login,
} from '../controllers/user.controller.js';
const router = Router();

router.get('/getUsers', getUsers);
router.get('/getUser/:userId', getUser);
router.post('/register', register);
router.post('/login', login);
router.delete('/deleteUser/:userId', deleteUser);

export default router;
