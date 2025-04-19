import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import logger from '@/services/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    logger.warn('❌ Invalid method for create-checkout-session API', { method: req.method });
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { amount, currency, orderData } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      logger.error('❌ Invalid amount provided', { amount });
      return res.status(400).json({ message: 'Invalid or missing amount. Amount must be a positive number.' });
    }

    if (!currency || typeof currency !== 'string') {
      logger.error('❌ Invalid currency provided', { currency });
      return res.status(400).json({ message: 'Invalid or missing currency.' });
    }

    if (!orderData || typeof orderData !== 'object') {
      logger.error('❌ Missing or invalid order data', { orderData });
      return res.status(400).json({ message: 'Missing or invalid order data.' });
    }

    logger.info('✅ Creating Stripe checkout session', { amount, currency, orderId: orderData?.orderId });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Speedy Van Delivery',
              description: `Order ID: ${orderData.orderId}`,
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/book-order`,
      metadata: {
        orderId: orderData.orderId,
        pickupAddress: orderData.pickupAddress,
        dropoffAddress: orderData.dropoffAddress,
      },
    });

    logger.info('✅ Checkout session created successfully', { sessionId: session.id });
    return res.status(200).json({ id: session.id });
  } catch (error: any) {
    logger.error(`❌ Error creating checkout session: ${error.message}`, {
      error,
      stack: error.stack,
    });
    return res.status(500).json({ message: 'Failed to create checkout session' });
  }
}
