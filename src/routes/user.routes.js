import {Router} from 'express'
import { getUsers, addUser, getUser, deleteUser, login } from '../controllers/user.controller.js';
const router = Router();

router.get('/getUsers', getUsers);
router.get('/getUser/:userId', getUser);
router.post('/addUser', addUser);
router.post('/login', login);
router.delete('/deleteUser/:userId', deleteUser);

export default router;