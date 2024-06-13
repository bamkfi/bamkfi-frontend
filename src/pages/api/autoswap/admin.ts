// admin only

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
    ethAccount = typeof req.body === 'string' ? JSON.parse(req.body).eth_account : req.body.eth_account;
  }

  if (!session.address || !ethAccount || !process.env.AUTHORIZED_MINTER_ETH_ADDRESS || session.address.toLowerCase() !== process.env.AUTHORIZED_MINTER_ETH_ADDRESS.toLowerCase()) {
    res.status(401).end();
    return;
  }
  try {
    let response: any;
    if (req.method === 'GET') {
      response = await fetch(`${process.env.AUTOSWAP_BASE_URL}/admin/unminted?${new URLSearchParams(
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
      response = await fetch(`${process.env.AUTOSWAP_BASE_URL}/admin/mint`, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
          NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
          'Content-Type': 'application/json'
        },
      });
    }
    if (!response.ok) {
      throw new Error(response.status)
    } else {
      if (req.method === 'POST') {
        res.status(200).end();
      } else if (req.method === 'GET') {
        const data = await response.json();
        res.status(200).json(data);
      }
    }
  } catch (error) {
    console.error('Admin Proxy API Error:', error);
    res.status(500).end();
  }
}
