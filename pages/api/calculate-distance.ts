import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { pickupAddress, dropoffAddress } = req.body;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Missing API key' });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      pickupAddress
    )}&destinations=${encodeURIComponent(dropoffAddress)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]?.distance?.value) {
      return res.status(400).json({ message: 'Failed to calculate distance' });
    }

    const distanceInKm = data.rows[0].elements[0].distance.value / 1000;
    return res.status(200).json({ distance: distanceInKm });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
}
