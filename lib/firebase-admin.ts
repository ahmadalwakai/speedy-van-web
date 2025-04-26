import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const tempPath = path.join('/tmp', 'dialogflow_key.json');

if (!fs.existsSync(tempPath)) {
  const base64Key = process.env.DIALOGFLOW_KEY_BASE64;
  if (!base64Key) {
    throw new Error('Missing Dialogflow key in environment variables');
  }
  const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
  fs.writeFileSync(tempPath, decoded);
}

const serviceAccount = require(tempPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
