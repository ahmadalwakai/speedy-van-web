import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body;

  try {
    const openAiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are SpeedyBot, a helpful assistant for delivery services.' },
          { role: 'user', content: message }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const aiReply = openAiRes.data.choices[0]?.message?.content?.trim();
    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: "🤖 Sorry, I'm having trouble connecting to the AI service. Please try again or email support@speedyvan.com." });
  }
};

export default handler;
