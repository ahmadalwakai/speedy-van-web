import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';
import logger from '@/services/logger';

// ✅ Define User type
type User = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, uid, name } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in token' });
    }

    let user: User | null = await mockGetUserByEmail(email);
    
    if (!user) {
      user = await mockCreateUser({
        email,
        username: name || email.split('@')[0],
        authProvider: 'google',
        providerId: uid
      });
    }

    if (!user) {
      throw new Error('User creation failed');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info(`Google login successful for ${email}`);

    return res.status(200).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`Google login failed: ${error}`);
    return res.status(401).json({ 
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ✅ Mock functions with proper return types
async function mockGetUserByEmail(email: string): Promise<User | null> {
  return null;  // Simulate user not found
}

async function mockCreateUser(userData: any): Promise<User> {
  return { 
    id: 'newuser123', 
    email: userData.email,
    username: userData.username,
    role: 'user'
  };
}
