import nodemailer from 'nodemailer';
import logger from './logger';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'no-reply@speedy-van.co.uk',
    pass: process.env.EMAIL_PASS || 'your-email-password',
  },
});

// Verify email transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter verification failed:', error);
  } else {
    logger.info('Email transporter ready');
  }
});

// Interface for email options
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends an email using the configured transporter
 * @param options - Email options including recipient, subject, and content
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: '"Speedy Van" <no-reply@speedy-van.co.uk>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to} with subject: ${options.subject}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Sends a booking confirmation email
 * @param to - Recipient email address
 * @param bookingId - Unique booking ID
 * @param details - Booking details
 */
export const sendBookingConfirmation = async (
  to: string,
  bookingId: string,
  details: { pickup: string; dropoff: string; date: string }
): Promise<void> => {
  const subject = `Booking Confirmation - ${bookingId}`;
  const html = `
    <h2>Booking Confirmation</h2>
    <p>Thank you for booking with Speedy Van!</p>
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Pickup:</strong> ${details.pickup}</p>
    <p><strong>Dropoff:</strong> ${details.dropoff}</p>
    <p><strong>Date:</strong> ${details.date}</p>
    <p>For any inquiries, contact us at support@speedy-van.co.uk.</p>
  `;
  await sendEmail({ to, subject, html });
};

/**
 * Sends an order status update email
 * @param to - Recipient email address
 * @param orderId - Unique order ID
 * @param status - Current order status
 */
export const sendOrderStatusUpdate = async (
  to: string,
  orderId: string,
  status: string
): Promise<void> => {
  const subject = `Order Status Update - ${orderId}`;
  const html = `
    <h2>Order Status Update</h2>
    <p>Your order <strong>${orderId}</strong> has been updated.</p>
    <p><strong>Status:</strong> ${status}</p>
    <p>For billing inquiries, contact billing@speedy-van.co.uk.</p>
  `;
  await sendEmail({ to, subject, html });
};

/**
 * Sends a Stripe payment confirmation email
 * @param to - Recipient email address
 * @param paymentId - Stripe payment ID
 * @param amount - Payment amount
 */
export const sendStripeConfirmation = async (
  to: string,
  paymentId: string,
  amount: number
): Promise<void> => {
  const subject = `Payment Confirmation - ${paymentId}`;
  const html = `
    <h2>Payment Confirmation</h2>
    <p>Thank you for your payment!</p>
    <p><strong>Payment ID:</strong> ${paymentId}</p>
    <p><strong>Amount:</strong> £${(amount / 100).toFixed(2)}</p>
    <p>For billing inquiries, contact billing@speedy-van.co.uk.</p>
  `;
  await sendEmail({ to, subject, html });
};

/**
 * Sends a driver application confirmation email
 * @param to - Recipient email address
 * @param applicationId - Unique application ID
 */
export const sendDriverApplicationConfirmation = async (
  to: string,
  applicationId: string
): Promise<void> => {
  const subject = `Driver Application Received - ${applicationId}`;
  const html = `
    <h2>Driver Application Confirmation</h2>
    <p>Thank you for applying to drive with Speedy Van!</p>
    <p><strong>Application ID:</strong> ${applicationId}</p>
    <p>Our team will review your application and contact you soon.</p>
    <p>If you need to submit additional documents, please send them to documents@speedy-van.co.uk.</p>
  `;
  await sendEmail({ to, subject, html });
};