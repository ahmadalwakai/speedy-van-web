import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, body } = req.body;
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}