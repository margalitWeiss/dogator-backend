import cron from 'node-cron';
import { getPlaydatesForToday } from '../services/playDateServices';
import {sendNotificationToDevice} from '../services/notificationService'

cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const playdates = await getPlaydatesForToday(today);
  for (const pd of playdates) {
    await sendNotificationToDevice(pd.host_user_id, 'Playdate', 'You have a playdate today 🐶!');
    await sendNotificationToDevice(pd.participant_user_id, 'Playdate', 'You have a playdate today 🐶!');    
  }
  
});