import { Web3Provider } from '../../components/providers/Web3Provider';

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <Web3Provider>{children}</Web3Provider>
  }