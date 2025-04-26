import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Mock response - في الواقع يجب تخزين المستخدم في قاعدة البيانات
  return res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: 'newuser123',
      email,
      username
    }
  });
}
