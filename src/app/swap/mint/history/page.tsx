'use client'

import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSIWE } from 'connectkit'
import styles from './History.module.css'
import React from 'react'
import NUSDIcon from '../../../../icons/nusd'
import { isExpired } from '../../../../utils'
import { Button } from '../../../../components/ui/button'
import { CircleCheckIcon } from '../../../../icons/CircleCheckIcon'
import { WarningOutlineIcon } from '../../../../icons/WarningOutlineIcon'
import CountdownTimer from '@/components/CountdownTimer'
import { GridSpinner } from '@/components/Loaders'
import { useFromTokenInfo } from '../_hooks/useFromTokenInfo'

const ValueWithLoader = (props: { value: string }) => {
	return (
		<div className={styles.valueContainer}>
			{!props.value && <GridSpinner color="white" />}
			<div>{props.value || 'Processing...'}</div>
		</div>
	)
}

function getStatus({
	ethTxid,
	btcTxid,
	expires
}: {
	ethTxid: string
	btcTxid: string
	expires: number
}) {
	let status: 'Completed' | 'In Progress' | 'Cancelled'
	if (btcTxid) {
		status = 'Completed'
	} else if (isExpired(expires) && !ethTxid) {
		status = 'Cancelled'
	} else {
		status = 'In Progress'
	}
	return status
}

const MintHistoryCard: React.FC<{
	depositId: string
	timestamp: string
	expires: number
	btcTxid: string
	ethTxid: string
	fromUsdeAmount: number
	toBtcAddress: string
	depositUsdeTotalAmount: number
	depositUsdeAccount: string
	status: ReturnType<typeof getStatus>
	fromTokenInfo: ReturnType<typeof useFromTokenInfo>
}> = props => {
	return (
		<div key={props.expires} className={styles.card}>
			<div className={styles.labeledValuesContainer}>
				<div>
					<label className={styles.label}>Order Placed</label>
					<div className={styles.valueContainer}>
						{new Date(parseInt(props.timestamp) * 1000).toLocaleString()}
					</div>
				</div>
				<div>
					<label className={styles.label}>Order ID</label>
					<div className={styles.valueContainer}>{props.depositId}</div>
				</div>
				<div>
					<div className={styles.label}>Amount</div>
					<div className={styles.valueContainer}>
						<div className="bg-[#F7931A] p-[0.4rem] rounded-full">
							<NUSDIcon height={14} width={14} className="stroke-primary" />
						</div>
						{(Number(props.fromUsdeAmount) / 10 ** props.fromTokenInfo.tokenDecimals).toLocaleString()} NUSD
					</div>
				</div>
				<div>
					<label className={styles.label}>To Address</label>
					<div className={styles.valueContainer}>{props.toBtcAddress}</div>
				</div>
				{props.status !== 'Cancelled' && (
					<div>
						<label className={styles.label}>{props.fromTokenInfo.ticker} Deposit Transaction ID</label>
						<ValueWithLoader value={props.ethTxid} />
					</div>
				)}
				{props.ethTxid && props.status !== 'Cancelled' && (
					<div>
						<label className={styles.label}>NUSD Mint Transaction ID</label>
						<ValueWithLoader value={props.btcTxid} />
					</div>
				)}
				{props.status === 'In Progress' && (
					<div>
						{!props.ethTxid ? (
							<div className="text-center opacity-75 text-sm mt-4">
								Please wait a minute for us to confirm payment. Order expires in{' '}
								<CountdownTimer targetUnixTimestamp={props.expires} />.
							</div>
						) : !props.btcTxid ? (
							<div className="text-center opacity-75 text-sm mt-4">
								Minting can take up to 24 hours to process. The tool is being rolled out in stages
								and manual checks are imposed before any funds are sent to prioritize security.
							</div>
						) : null}
					</div>
				)}
				{props.status !== 'In Progress' && (
					<div>
						<label className={styles.label}>Order Status</label>
						<div className={styles.valueContainer}>
							{props.status === 'Completed' && (
								<CircleCheckIcon size="1.5rem" fill="rgb(60, 179, 113)" />
							)}
							{props.status === 'Cancelled' && (
								<WarningOutlineIcon size="1.5rem" fill="rgb(205, 92, 92)" />
							)}
							{props.status}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function MintHistory() {
	const account = useAccount()
	const fromTokenInfo = useFromTokenInfo()
	const siwe = useSIWE()
	const [page, setPage] = useState(1)
	const limit = 5
	const needsRefreshRef = useRef(false)
	const getDepositResponse = useQuery({
		queryKey: ['deposit-history', account.address, page],
		queryFn: async () => {
			const response = await fetch(
				`/api/autoswap/deposits?${new URLSearchParams({
					eth_account: account.address as string,
					limit: limit.toString(),
					offset: ((page - 1) * limit).toString(),
					contract_id: fromTokenInfo.contractId,
				}).toString()}`,
				{
					method: 'GET'
				}
			)
			if (!response.ok) {
				return null
			}
			const data = await response.json()
			needsRefreshRef.current = data.deposits.some(
				(d: any) =>
					getStatus({ btcTxid: d.btc_txid, ethTxid: d.eth_txid, expires: d.expires }) ===
					'In Progress'
			)
			return data
		},
		enabled: !!account.isConnected && siwe.isSignedIn,
		refetchInterval: needsRefreshRef.current ? 30_000 : false
	})
	if (getDepositResponse.isFetching) return <div className="text-center mt-2">Loading...</div>
	if (!account.isConnected || !siwe.isSignedIn) {
		return <div className="text-center mt-2">Connect to view history</div>
	}
	const data = getDepositResponse.data
	if (!data?.total || !data?.deposits.length)
		return <div className="text-center mt-2">No order history</div>
	const numPages = Math.ceil(data.total / limit)
	return (
		<>
			<div className={styles.cardsContainer}>
				{data.deposits.map((d: any) => (
					<div key={d.expires} className={styles.cardWrapper}>
						<MintHistoryCard
							btcTxid={d.btc_txid}
							ethTxid={d.eth_txid}
							depositId={d.uuid}
							timestamp={d.timestamp}
							expires={d.expires}
							fromUsdeAmount={d.from_usde_amount}
							toBtcAddress={d.to_btc_address}
							depositUsdeTotalAmount={d.deposit_usde_total_amount}
							depositUsdeAccount={d.deposit_usde_account}
							status={getStatus({
								ethTxid: d.eth_txid,
								btcTxid: d.btc_txid,
								expires: d.expires
							})}
							fromTokenInfo={fromTokenInfo}
						/>
					</div>
				))}
			</div>
			{data.total > limit && (
				<div className="flex justify-around mt-2">
					<Button
						variant="outline"
						onClick={() => page > 0 && setPage(page - 1)}
						disabled={page === 1 || getDepositResponse.isFetching}
					>
						&lt; Newer
					</Button>
					<Button
						variant="outline"
						onClick={() => page < numPages && setPage(page + 1)}
						disabled={page === numPages || getDepositResponse.isFetching}
					>
						Older &gt;
					</Button>
				</div>
			)}
		</>
	)
}

export default MintHistory;
