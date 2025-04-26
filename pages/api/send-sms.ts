import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { phoneNumber, orderNumber, totalPrice } = req.body;

  if (!phoneNumber || !orderNumber) {
    return res.status(400).json({ message: 'Missing phone number or order number' });
  }

  try {
    await client.messages.create({
      body: `Speedy Van: Your order ${orderNumber} has been received. Total: £${totalPrice.toFixed(2)}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.status(200).json({ message: 'SMS sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
