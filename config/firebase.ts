
import admin from 'firebase-admin';
import path from 'path';


// const serviceAccount = require('../dogator-chat-feaure-firebase-adminsdk-fbsvc-ac501a980b.json');
const serviceAccount = require(path.join(__dirname, '../dogator-chat-feaure-firebase-adminsdk-fbsvc-ac501a980b.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://dogator-chat-feaure-default-rtdb.firebaseio.com/',
  });
}

export default admin;
export const database = admin.database();