import type { NextApiRequest, NextApiResponse } from 'next';

const coupons: Record<string, number> = {
  'SPEEDY10': 0.10,  // خصم 10%
  'FREEMOVE': 0.15,  // خصم 15%
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { coupon } = req.body;

  if (!coupon || typeof coupon !== 'string') {
    return res.status(400).json({ message: 'Coupon code is required and must be a string' });
  }

  const code = coupon.toUpperCase();
  const discount = coupons[code];

  if (discount) {
    return res.status(200).json({ valid: true, discount });
  } else {
    return res.status(200).json({ valid: false });
  }
}
