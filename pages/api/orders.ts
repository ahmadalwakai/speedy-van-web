import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import logger from '@/services/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Mock API for orders and payments
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, pickupLocations, dropoffLocations, packageTypes, paymentIntentId } = req.body;
    logger.info(`Creating order for user: ${username}`);
    res.status(201).json({
      id: Math.random().toString(),
      username,
      pickupLocations,
      dropoffLocations,
      packageTypes,
      status: 'pending',
      price: 10,
      paymentIntentId,
    });
  } else if (req.method === 'GET') {
    const { username, page = '1', limit = '10' } = req.query;
    logger.info(`Fetching orders for user: ${username}, page: ${page}, limit: ${limit}`);
    res.status(200).json([
      {
        id: '1',
        username,
        pickupLocations: ['Location A'],
        dropoffLocations: ['Location B'],
        packageTypes: ['Box'],
        status: 'pending',
        price: 10,
        paymentIntentId: 'pi_mock_123',
      },
    ]);
  } else if (req.method === 'PATCH') {
    const { id } = req.query;
    logger.info(`Updating order status for order: ${id}`);
    res.status(200).json({ message: 'Order updated' });
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    logger.info(`Cancelling order: ${id}`);
    res.status(200).json({ message: 'Order cancelled' });
  } else if (req.method === 'POST' && req.url?.includes('create-payment-intent')) {
    const { amount } = req.body;
    try {
      logger.info(`Creating payment intent for amount: ${amount}`);
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      logger.error(`Payment intent creation failed: ${error}`);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    logger.warn(`Method not allowed: ${req.method}`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
