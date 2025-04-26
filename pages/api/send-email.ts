import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, orderNumber, totalPrice } = req.body;

  if (!email || !orderNumber) {
    return res.status(400).json({ message: 'Missing email or order number' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Speedy Van" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    text: `Thank you for your order! Your order number is ${orderNumber}. Total: £${totalPrice.toFixed(2)}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
