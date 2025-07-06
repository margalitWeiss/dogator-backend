import { Request, Response } from 'express';
import { sendNotificationToDevice } from '../services/notificationService';

export const sendNotification = async (req: Request, res: Response) => {
  const { fcmToken, title, body, data } = req.body;

  try {
    const response = await sendNotificationToDevice(fcmToken, title, body, data);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
