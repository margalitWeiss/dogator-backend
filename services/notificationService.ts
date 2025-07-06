
import admin from '../config/firebase';

export const sendNotificationToDevice = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data: data || {},
  };
  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
