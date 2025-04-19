import type { NextApiRequest, NextApiResponse } from 'next';

// قاعدة بيانات وهمية للتجربة
const mockCoupons = [
  {
    code: 'WELCOME10',
    discount: 0.1,
    isActive: true,
    expiresAt: '2025-12-31T23:59:59Z',
    maxUses: 100,
    usedCount: 20,
  },
  {
    code: 'EXPIRED20',
    discount: 0.2,
    isActive: false,
    expiresAt: '2023-12-31T23:59:59Z',
    maxUses: 50,
    usedCount: 50,
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { code } = req.body;

  const coupon = mockCoupons.find(c => c.code.toLowerCase() === code?.toLowerCase());

  if (!coupon) {
    return res.status(404).json({ valid: false, message: 'Coupon not found' });
  }

  const isExpired = new Date(coupon.expiresAt) < new Date();
  const isMaxedOut = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

  if (!coupon.isActive || isExpired || isMaxedOut) {
    return res.status(400).json({
      valid: false,
      message: 'Coupon is invalid or expired',
    });
  }

  return res.status(200).json({
    valid: true,
    discount: coupon.discount,
    message: 'Coupon applied successfully',
  });
}
