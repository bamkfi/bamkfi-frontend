import { configureServerSideSIWE } from 'connectkit-next-siwe';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { fallback, http, webSocket } from 'wagmi';

const chain = process.env.VERCEL_ENV === 'production' ? mainnet : sepolia;
const transport = process.env.VERCEL_ENV === 'production' ? fallback([
  webSocket(
    `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`
  ),
  http(
    `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
  ),
]) : fallback([
  webSocket(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  ),
  http(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  ),
]);

export const siweServer = configureServerSideSIWE({
  config: {
    chains: [chain],
    transports: {
      [chain.id]: transport,
    }
  },
});
