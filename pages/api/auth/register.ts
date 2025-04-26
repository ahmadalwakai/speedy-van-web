import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, username, password } = req.body;

  // تحسين: التحقق من وجود البريد الإلكتروني مسبقًا (محاكاة)
  if (email === 'existing@example.com') {
    return res.status(400).json({ message: 'Email already in use' });
  }

  // Mock response
  return res.status(200).json({
    token: 'mocked_jwt_token',
    refreshToken: 'mocked_refresh_token',
    user: { email, username },
  });
}