import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await fetch(`${process.env.OPI_BASE_URL}/v1/runes/get_current_balance_of_wallet?address=${req.query.address}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPI_API_KEY as string}`,
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('getBrc20BalanceByAddress Error:', error);
    res.status(500).end();
  }
}
