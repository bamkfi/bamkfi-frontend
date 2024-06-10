import type { NextApiRequest, NextApiResponse } from 'next';
import { siweServer } from '../../../siwe/siweServer';
import {
  GetDepositResponse,
  GetDepositsQueryParams,
  PostDepositRequest,
} from '../../../lib/autoswap';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetDepositResponse | string>
) {
  const { from_eth_account } =
    req.body && (JSON.parse(req.body) as PostDepositRequest);
  const { eth_account } = req.query as GetDepositsQueryParams;
  const ethAccount = eth_account || from_eth_account;
  const session = await siweServer.getSession(req, res);
  if (!session.address || !ethAccount || session.address !== ethAccount) {
    void res.status(401).end();
  }
  try {
    const url = `${process.env.AUTOSWAP_BASE_URL}/deposits?${new URLSearchParams(
      {
        ...req.query as Record<string, string>,
        ...(eth_account ? { eth_account: eth_account.toLowerCase() } : {}),
      }
    )}`;
    if (req.body.from_eth_account) {
      req.body.from_eth_account = req.body.from_eth_account.toLowerCase()
    }
    const response = await fetch(url, {
      method: req.method,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
        ...(req.method !== 'GET' && { 'Content-Type': 'application/json' }),
      },
    });
    if (!response.ok) {
      void res.status(response.status).send(await response.text());
    }
    const data = await response.json();
    void res.status(200).json(data);
  } catch (error) {
    console.error('Proxy API Error:', error);
    void res.status(500).send(JSON.stringify(error));
  }
}
