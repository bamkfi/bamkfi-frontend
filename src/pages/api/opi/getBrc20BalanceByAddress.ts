import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const url = 'https://calhounjohn.com/opi/v1/brc20/get_current_balance_of_wallet?address=bc1pl83ud3ex0sdmxzl0l0qn0655y92ll79g5gg028qjqm8er38g0eqqyye8u6&ticker=$NUSD'
    // const url = `${process.env.OPI_BASE_URL}/v1/brc20/get_current_balance_of_wallet?address=${req.query.address}&ticker=$NUSD`;
    const response = await fetch(url, {
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
