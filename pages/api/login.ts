import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  id: 'user123',
  username: 'testuser'
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (email === mockUser.email && password === mockUser.password) {
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username
      }
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
}
