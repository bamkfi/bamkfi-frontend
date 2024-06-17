'use client';

import React from 'react';

import { WagmiProvider, createConfig, fallback, http, webSocket } from 'wagmi';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { configureClientSIWE } from 'connectkit-next-siwe';
import { Mulish } from 'next/font/google';

const mulish = Mulish({ subsets: ['latin'] })

const siweClient = configureClientSIWE({
  apiRoutePrefix: '/api/siwe',
  statement: 'Sign In With Ethereum to prove you control this wallet.',
});

const chain = process.env.VERCEL_ENV === 'production' ? mainnet : sepolia;
const transport = process.env.VERCEL_ENV === 'production' ? fallback([
  webSocket(
    `wss://mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
  ),
  http(
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
  ),
]) : fallback([
  webSocket(
    `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
  ),
  http(
    `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
  ),
]);
const config = createConfig(
  getDefaultConfig({
    appName: 'Bamk.fi',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [chain],
    transports: {
      [chain.id]: transport,
    }
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <siweClient.Provider>
          <ConnectKitProvider
            debugMode={process.env.NODE_ENV === 'development'}
            options={{
              hideQuestionMarkCTA: true,
              hideNoWalletCTA: true,
              overlayBlur: 1,
              enforceSupportedChains: true,
              embedGoogleFonts: true,
            }}
            theme="midnight"
            customTheme={{
              "--ck-spinner-color": "#f7951d",
              "--ck-font-family": mulish.style.fontFamily,
            }}
          >
            {children}
          </ConnectKitProvider>
        </siweClient.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
