import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
// @ts-ignore
import PDFDocument from 'pdfkit';
import { Item } from '@/components/BookOrder';

interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  pickupAddress: string;
  dropoffAddress: string;
  items: Item[];
  totalPrice: number;
  workers: number;
  pickupDateTime: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const orderData: OrderData = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('Speedy Van Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Customer: ${orderData.firstName} ${orderData.lastName}`);
    doc.text(`Email: ${orderData.email}`);
    doc.text(`Pickup: ${orderData.pickupAddress}`);
    doc.text(`Dropoff: ${orderData.dropoffAddress}`);
    doc.text(`Date: ${new Date(orderData.pickupDateTime).toLocaleString()}`);
    doc.text(`Workers: ${orderData.workers}`);
    doc.moveDown();
    doc.text('Items:', { underline: true });
    orderData.items.forEach((item) => {
      doc.text(`${item.quantity} x ${item.type} (${item.size})`);
    });
    doc.moveDown();
    doc.text(`Total Price: £${orderData.totalPrice.toFixed(2)}`, { align: 'right' });
    doc.end();

    await new Promise<void>((resolve) => {
      doc.on('end', resolve);
    });

    const pdfBuffer = Buffer.concat(buffers);

    await transporter.sendMail({
      from: '"Speedy Van" <support@speedyvan.com>',
      to: orderData.email,
      subject: 'Your Speedy Van Booking Confirmation',
      text: `Dear ${orderData.firstName},\n\nThank you for booking with Speedy Van! Your delivery is confirmed.\n\nDetails:\n- Pickup: ${orderData.pickupAddress}\n- Dropoff: ${orderData.dropoffAddress}\n- Date: ${new Date(orderData.pickupDateTime).toLocaleString()}\n- Total Price: £${orderData.totalPrice.toFixed(2)}\n\nAttached is your invoice.\n\nBest regards,\nSpeedy Van Team`,
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email', error: (error as Error).message });
  }
}
