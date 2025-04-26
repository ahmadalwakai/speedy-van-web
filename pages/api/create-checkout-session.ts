import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// ✅ تهيئة Stripe بدون تحديد apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount, currency, orderData } = req.body;

  if (!amount || amount <= 0 || !currency || !orderData?.orderNumber) {
    return res.status(400).json({ message: 'Invalid payment data' });
  }

  try {
    console.log("🔹 Creating Stripe Session:", { amount, currency, orderNumber: orderData.orderNumber });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Speedy Van Order (${orderData.orderNumber})`,
              description: 'Your delivery booking with Speedy Van',
            },
            unit_amount: Math.round(amount),  // Stripe يتطلب المبلغ بـ pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        orderId: orderData.orderId || 'N/A',
        customerEmail: orderData.email || 'N/A',
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (error: any) {
    console.error('❌ Stripe Checkout Session Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
