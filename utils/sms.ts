import twilio from 'twilio';
import { Item } from '../components/BookOrder'; // افتراض أن Item معرف في BookOrder.tsx

interface OrderData {
  firstName: string;
  phoneNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  items: Item[];
  totalPrice: number;
  pickupDateTime: string;
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendConfirmationSMS = async (orderData: OrderData): Promise<void> => {
  try {
    await client.messages.create({
      body: `Dear ${orderData.firstName}, your Speedy Van booking is confirmed! Pickup: ${orderData.pickupAddress}, Dropoff: ${orderData.dropoffAddress}, Date: ${new Date(orderData.pickupDateTime).toLocaleString()}, Total: £${orderData.totalPrice.toFixed(2)}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: orderData.phoneNumber,
    });

    console.log('Confirmation SMS sent to:', orderData.phoneNumber);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send confirmation SMS');
  }
};