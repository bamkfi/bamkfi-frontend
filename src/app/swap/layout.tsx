'use client'

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-children-prop */

import React from 'react'
import styles from './_styles/swap.module.css'
import { CustomConnectKitButton } from '@/components/ConnectKitButton'
import classNames from 'classnames'
import { BtcWalletProvider, ConnectBtcModal } from '../../components/providers/BtcWalletProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'
import Navigation from '@/components/navigation'
import { usePathname } from 'next/navigation'

const SwapPage = ({ children } : { children: React.ReactNode }) => {
	const links = React.useMemo(() => {
		const value = [
			{
				name: 'Mint',
				href: '/swap/mint'
			},
			{
				name: 'Redeem',
				href: '/swap/redeem'
			},
		]
		return value;
	}, [])
 	const pathname = usePathname()
	return (
		<div className={classNames(styles.exchangeContainer, 'px-4')}>
			<div className="flex justify-between mb-2">
				<div className="flex items-center ml-2">
					<Navigation links={links} />
				</div>
				<>
					{pathname?.includes('/swap/mint') ? (
						<CustomConnectKitButton />
					) : pathname?.includes('/swap/redeem') ? (
						<ConnectBtcModal />
					) : null}
				</>
			</div>
			{children}
		</div>
	)
}

const SwapProviders = ({
	children,
}: {
	children: React.ReactNode
}) => {
	return (
		<BtcWalletProvider>
			<Web3Provider>
				{children}
			</Web3Provider>
		</BtcWalletProvider>
	)
}

export default function SwapLayout({ children } : { children: React.ReactNode }) {
	return (
		<SwapProviders>
			<SwapPage>
				{children}
			</SwapPage>
		</SwapProviders>
	)
};
