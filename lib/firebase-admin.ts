import * as admin from 'firebase-admin';
const serviceAccount = require('../config/dialogflow_key.json');  // استخدام require لملفات JSON

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
