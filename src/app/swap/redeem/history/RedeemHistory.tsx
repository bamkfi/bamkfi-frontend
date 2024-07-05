'use client'

import { GridSpinner } from '@/components/Loaders'
import { useWallet } from '@/components/providers/BtcWalletProvider'
import { useQuery } from '@tanstack/react-query'
import React, { useRef, useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { CircleCheckIcon } from '../../../../icons/CircleCheckIcon'
import Link from 'next/link'
import styles from '../../mint/history/History.module.css'
import UsdeIcon from '@/icons/USDe'
import Navigation from "@/components/navigation";
import { CaretLeftIcon, CopyIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import swapStyles from '@/app/swap/_styles/swap.module.css'

const ValueWithLoader = (props: { value: string | null; loadingLabel?: string; }) => {
	return (
		<div className={styles.valueContainer}>
			{!props.value && <GridSpinner color="white" />}
			<div>{props.value || props.loadingLabel || 'Processing...'}</div>
		</div>
	)
}

function getStatus({
	ethTxid,
}: {
	ethTxid: Redeem['eth_txid']
}) {
	let status: 'Completed' | 'In Progress'
	if (ethTxid) {
		status = 'Completed'
	} else {
		status = 'In Progress'
	}
	return status
}

export type Redeem = {
	uuid: string;
	from_btc_address: string;
	from_nusd_amount: number;
	to_eth_account: string;
	to_nusd_address: string;
	btc_txid: string | null;
	eth_txid: string | null;
	created_at: number;
  };
import { CalendarIcon } from "@radix-ui/react-icons";
import { toast } from 'react-toastify'
import NusdIcon from '@/icons/nusd'
import { Badge } from '@/components/ui/badge'
import { ArrowIcon } from '@/icons/ArrowIcon'

const RedeemHistoryCard: React.FC<Redeem> = props => {
	const status = getStatus({
		ethTxid: props.eth_txid,
	})
	return (
		<div className={styles.card}>
			<div className={styles.labeledValuesContainer}>
				<div>
					<label className={styles.label}>Order ID</label>
					<div className="flex items-center">
						<Link href={`/swap/redeem/history/${props.uuid}`} className="hover:underline">	
							<div className={styles.valueContainer}>{props.uuid}</div>
						</Link>
					</div>
				</div>
				<div>
					<label className={styles.label}>Date Created</label>
					<div className={styles.valueContainer}>
						<CalendarIcon />
						{new Date(props.created_at * 1000).toLocaleString()}
					</div>
				</div>
				<div>
					<div className={styles.label}>You send</div>
					<div className={styles.valueContainer}>
						<div className="rounded-full bg-[#F7931A] p-[0.4rem]">
							<NusdIcon height={14} width={14} className="stroke-primary" />
						</div>
						<div className="flex-grow">
							{(Number(props.from_nusd_amount)).toLocaleString()} NUSD•NUSD•NUSD•NUSD
						</div>
						<Badge variant={"outline"} className="border-[#F7931A] text-[#F7931A] rounded-sm whitespace-nowrap"> 
							Runes
						</Badge>
					</div>
				</div>
				<div>
					<div className={styles.label}>From address</div>
					<div className={styles.valueContainer}>
						<div className="break-all">{props.from_btc_address}</div>
					</div>
				</div>
				<div>
					<div className={styles.label}>To address</div>
					<div className={styles.valueContainer}>
						<div className="flex items-center w-full gap-2">
							<div className="break-all flex-grow">{props.to_nusd_address}</div> {/* TODO: modify this to have a bamkfi green check next to it? */}
							{!props.btc_txid && (
								<Button 
									variant="default" 
									size="sm"
									className="h-8 px-2 flex-shrink-0 rounded-sm"
									onClick={() => {
										navigator.clipboard.writeText(props.to_nusd_address);
										toast.success("Address copied to clipboard");
									}}
								>
									<CopyIcon className="h-4 w-4 mr-1" />
									Copy
								</Button>
							)}
						</div>
					</div>
				</div>
				<div>
					<label className={styles.label}>Deposit Transaction ID</label>
					<ValueWithLoader value={props.btc_txid} loadingLabel='Awaiting Deposit' />
				</div>
				<div className={"my-4"}>
					<div className={swapStyles.arrow}>
						<ArrowIcon />
					</div>
				</div>
				<div>
					<label className={styles.label}>You receive</label>
					<div className={styles.valueContainer}>
						<div className="rounded-full">
							<UsdeIcon height={24} width={24} className="stroke-primary" />
						</div>
						{parseInt(props.from_nusd_amount.toString()).toLocaleString()} USDe
						<Badge variant="outline" className="border-white text-white rounded-sm">
							ERC-20
						</Badge>
					</div>
				</div>
				<div>
					<div className={styles.label}>To address</div>
					<div className={styles.valueContainer}>
						<div className="break-all">{props.to_eth_account}</div>
					</div>
				</div>
				{props.btc_txid && (
					<div>
						<label className={styles.label}>Redeem Transaction ID</label>
						<ValueWithLoader value={props.eth_txid} />
					</div>
				)}
				{status === 'In Progress' ? (
					<div>
						<div className="text-center opacity-75 text-xs mt-4">
							Please wait a few block confirmations for deposit transaction to be confirmed. Redeems are normally processed within 24 hours. The tool is being rolled out in stages
								and manual checks are imposed before any funds are sent to prioritize security.
						</div>
					</div>
				) : (
					<div>
						<label className={styles.label}>Status</label>
						<div className={styles.valueContainer}>
							{status === 'Completed' && (
								<CircleCheckIcon size="1.5rem" fill="rgb(60, 179, 113)" />
							)}
							{status}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
const DefaultNav = () => (
	<nav className="relative flex items-center justify-center mb-2 h-12">
		<div className="absolute left-0">
			<Link href="/swap/redeem">
				<Button aria-label="Back" variant="ghost">
					<div className="flex items-center gap-1 opacity-60">
						<CaretLeftIcon/>
						<div>Back</div>
					</div>
				</Button>
			</Link>
		</div>
		<div className="absolute left-1/2 transform -translate-x-1/2">
			<Navigation links={[{ href: "/swap/redeem/history", name: 'History'}]} />
		</div>
	</nav>
)
export const RedeemHistory = ({ orderId, nav = <DefaultNav /> }: { orderId?: string; nav?: React.ReactNode }) => {
	const [page, setPage] = useState(1)
	const limit = 10;
	const needsRefreshRef = useRef(false)
	const wallet = useWallet()
	const getRedeemResponse = useQuery({
		queryKey: ['redeem-history', wallet.address, page],
		queryFn: async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/redeems?${new URLSearchParams({
					...wallet.authorization,
					order_id: orderId || "",
					limit: limit.toString(),
					offset: ((page - 1) * limit).toString()
				}).toString()}`,
				{
					method: 'GET'
				}
			)
			if (!response.ok) {
				return null
			}
			const data = await response.json()
			needsRefreshRef.current = data.redeems.some(
				(d: any) =>
					getStatus({ ethTxid: d.eth_txid }) ===
					'In Progress'
			)
			return data
		},
		enabled: !!wallet.connected && !!wallet.authorization,
		refetchInterval: needsRefreshRef.current ? 30_000 : false
	})

	if (getRedeemResponse.isLoading) return <div className="text-center mt-2">Loading...</div>
	if (!wallet.connected || !wallet.authorization) {
		return <div className="text-center mt-5">Connect to view history</div>
	}
	const data = getRedeemResponse.data
	if (!data?.total || !data?.redeems.length)
		return <div className="text-center mt-2">No order history</div>
	const numPages = Math.ceil(data.total / limit)
	return (
		<>
			{nav}
			<div className={styles.cardsContainer}>
				{data.redeems.map((r: Redeem) => (
					<div key={r.uuid} className={styles.cardWrapper}>
						<RedeemHistoryCard
							{...r}
						/>
					</div>
				))}
			</div>
			{data.total > limit && (
				<div className="flex justify-around mt-2">
					<Button
						variant="outline"
						onClick={() => page > 0 && setPage(page - 1)}
						disabled={page === 1 || getRedeemResponse.isFetching}
					>
						&lt; Newer
					</Button>
					<Button
						variant="outline"
						onClick={() => page < numPages && setPage(page + 1)}
						disabled={page === numPages || getRedeemResponse.isFetching}
					>
						Older &gt;
					</Button>
				</div>
			)}
		</>
	)
}