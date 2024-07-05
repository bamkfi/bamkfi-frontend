import type { NextApiRequest, NextApiResponse } from 'next';
import { siweServer } from '../../../siwe/siweServer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await siweServer.getSession(req, res);
  let ethAccount = ''
  if (req.method === 'GET') {
    ethAccount = `${req.query.eth_account}`
  } else if (req.method === 'POST') {
    ethAccount = typeof req.body === 'string' ? JSON.parse(req.body).from_eth_account : req.body.from_eth_account;
  }
  if (!session.address || !ethAccount || session.address.toLowerCase() !== ethAccount.toLowerCase()) {
    res.status(401).end();
    return;
  }
  try {
    let response: any;
    if (req.method === 'GET') {
      response = await fetch(`${process.env.AUTOSWAP_BASE_URL}/deposits?${new URLSearchParams(
          {
            ...req.query as Record<string, string>,
            eth_account: ethAccount,
          }
        )}`, {
        method: 'GET',
        headers: {
          NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
        },
      });
    } else if (req.method === 'POST') {
      console.log('POSTING',req.body)
      response = await fetch(`${process.env.AUTOSWAP_BASE_URL}/deposits`, {
        method: 'POST',
        body: req.body,
        headers: {
          NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
          'Content-Type': 'application/json'
        },
      });
    }
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Deposits Proxy API Error:', error);
    res.status(500).end();
  }
}
