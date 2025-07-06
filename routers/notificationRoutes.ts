import express from 'express';
import { sendNotification } from '../controllers/notificationController';
import { checkAuth } from '../middlewares/auth';
import { middlewareH } from '../types/handlers';

const router = express.Router();

router.post('/',checkAuth as middlewareH, sendNotification);

export default router;
