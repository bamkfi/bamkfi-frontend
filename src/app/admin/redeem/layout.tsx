import { BtcWalletProvider, ConnectBtcModal } from '@/components/providers/BtcWalletProvider';

export default function RedeemAdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <BtcWalletProvider>
        <ConnectBtcModal />
        {children}
      </BtcWalletProvider>
  }