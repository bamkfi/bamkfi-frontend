import type { NextApiRequest, NextApiResponse } from 'next';
import { siweServer } from '../../../siwe/siweServer';
import { USDE_CONTRACT_ADDRESS_MAINNET, USDT_CONTRACT_ADDRESS_MAINNET } from '@/lib/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await siweServer.getSession(req, res);
  let ethAccount = ''
  let contractId;
  if (req.method === 'GET') {
    ethAccount = `${req.query.eth_account}`
    contractId = req.query.contract_id
  } else if (req.method === 'POST') {
    ethAccount = typeof req.body === 'string' ? JSON.parse(req.body).from_eth_account : req.body.from_eth_account;
    contractId = typeof req.body === 'string' ? JSON.parse(req.body).contract_id : req.body.contract_id;
  }
  let autoswapBaseUrl = ''
  let autoswapApiKey = ''
  if (contractId === USDE_CONTRACT_ADDRESS_MAINNET) {
    autoswapBaseUrl = process.env.AUTOSWAP_BASE_URL as string
    autoswapApiKey = process.env.AUTOSWAP_API_KEY as string;
  } else if (contractId === USDT_CONTRACT_ADDRESS_MAINNET) {
    autoswapBaseUrl = process.env.AUTOSWAP2_BASE_URL as string
    autoswapApiKey = process.env.AUTOSWAP2_API_KEY as string;
  } else { // FIXME
    autoswapBaseUrl = process.env.AUTOSWAP2_BASE_URL as string // FIXME
    autoswapApiKey = process.env.AUTOSWAP2_API_KEY as string; // FIXME
  }
  
  if (!session.address || !ethAccount || session.address.toLowerCase() !== ethAccount.toLowerCase()) {
    res.status(401).end();
    return;
  }
  try {
    let response: any;
    if (req.method === 'GET') {
      response = await fetch(`${autoswapBaseUrl}/deposits?${new URLSearchParams(
          {
            ...req.query as Record<string, string>,
            eth_account: ethAccount,
          }
        )}`, {
        method: 'GET',
        headers: {
          NAKADO_API_KEY: autoswapApiKey as string,
        },
      });
    } else if (req.method === 'POST') {
      response = await fetch(`${autoswapBaseUrl}/deposits`, {
        method: 'POST',
        body: req.body,
        headers: {
          NAKADO_API_KEY: autoswapApiKey,
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
