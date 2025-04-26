import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // تحقق من صحة Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // يمكنك تخصيص البيانات التي تُرجعها هنا
    return res.status(200).json({
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
        picture: decodedToken.picture || '',
        provider: decodedToken.firebase.sign_in_provider
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error });
  }
}
