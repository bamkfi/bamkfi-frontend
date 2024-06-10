import { Web3Provider } from '../../components/providers/Web3Provider';

export default function SwapLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <Web3Provider>{children}</Web3Provider>
  }