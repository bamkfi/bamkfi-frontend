/** DISABLED IN FAVOR OF pages/api due to compatibility issues with app router...
 *  See https://github.com/m1guelpf/nextjs13-connectkit-siwe for potential solution
 *  rename this file to `route.ts` and try to build
 * 
 */

import { siweServer } from '../../../pages/api/siwe/siweServer';
import { NextResponse, NextRequest } from 'next/server';
import {
  PostDepositRequest,
} from './types';

export const dynamic = 'force-dynamic'

export async function GET(
    req: NextRequest,
  ) {
    const { searchParams } = new URL(req.url);
    const ethAccount = searchParams.get('eth_account')?.toLowerCase() || undefined;
    const session = await siweServer.getSession(req, NextResponse);
    if (!session.address || !ethAccount || session.address !== ethAccount) {
      return NextResponse.json({}, { status: 401 });
    }
    try {
      const url = `${process.env.AUTOSWAP_BASE_URL}/deposits?${searchParams.toString()}`;
      const response = await fetch(url, {
        method: req.method,
        headers: {
          NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
        },
      });
      if (!response.ok) {
        return NextResponse.json({ error: await response.text() }, { status: response.status })
      }
      const data = await response.json();
      return NextResponse.json(data)
    } catch (error) {
      console.error('Proxy API Error:', error);
      return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
    }
  }

export async function POST(
  req: NextRequest,
) {
  const { from_eth_account } =
    await req.json() as PostDepositRequest;
    const { searchParams } = new URL(req.url);
    const eth_account = searchParams.get('eth_account');
  const ethAccount = eth_account || from_eth_account.toLowerCase();
  const session = await siweServer.getSession(req, NextResponse);
  if (!session.address || !ethAccount || session.address !== ethAccount) {
    return NextResponse.json({}, { status: 401 });
  }
  try {
    const url = `${process.env.AUTOSWAP_BASE_URL}/deposits?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: req.method,
      body: req.body,
      headers: {
        NAKADO_API_KEY: process.env.AUTOSWAP_API_KEY as string,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: await response.text() }, { status: response.status })
    }
    const data = await response.json();
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy API Error:', error);
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}
