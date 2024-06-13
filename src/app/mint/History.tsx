import { useQuery } from '@tanstack/react-query'
import { FC, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSIWE } from 'connectkit'
import styles from './History.module.css'
import React from 'react'
import NUSDIcon from '../../icons/nusd'
import { Grid, GridProps } from 'react-loader-spinner'
import { isExpired } from '../../utils'
import { Button } from '../../components/ui/button'
import { CircleCheckIcon } from '../../icons/CircleCheckIcon'
import { WarningOutlineIcon } from '../../icons/WarningOutlineIcon'
import { RefreshIcon } from '@/icons/RefreshIcon'
import { toast } from 'react-toastify'

const GridSpinner: FC<GridProps & { color: string }> = props => (
	<Grid
		visible={true}
		height="20"
		width="20"
		ariaLabel="loading"
		radius="12"
		wrapperStyle={{}}
		wrapperClass="grid-wrapper"
		{...props}
	/>
)

const ValueWithLoader = (props: { value: string }) => {
	return (
		<div className={styles.valueContainer}>
			{!props.value && <GridSpinner color="white" />}
			<div>{props.value || 'Processing...'}</div>
		</div>
	)
}

function getStatus({ ethTxid, btcTxid, expires}: { ethTxid: string, btcTxid: string, expires: number }) {
	let status: 'Completed' | 'In Progress' | 'Cancelled' ;
	if (btcTxid) {
		status = 'Completed'
	} else if (isExpired(expires) && !ethTxid) {
		status = 'Cancelled'
	} else {
		status = 'In Progress'
	}
	return status;
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
						{(Number(props.fromUsdeAmount) / 10 ** 18).toLocaleString()} NUSD
					</div>
				</div>
				<div>
					<label className={styles.label}>To Address</label>
					<div className={styles.valueContainer}>{props.toBtcAddress}</div>
				</div>
				{props.status !== 'Cancelled' && (
					<div>
						<label className={styles.label}>USDe Deposit Transaction ID</label>
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
							<div className="text-center opacity-75">
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
							{props.status === 'Completed' && <CircleCheckIcon size="1.5rem" fill="rgb(60, 179, 113)" />}
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

export const MintHistory: FC = () => {
	const account = useAccount()
	const siwe = useSIWE()
	const [page, setPage] = useState(1)
	const limit = 5
	const getDepositResponse = useQuery({
		queryKey: ['deposit-history', account.address, page],
		queryFn: async () => {
			const response = await fetch(
				`/api/autoswap/deposits?${new URLSearchParams({
					eth_account: account.address as string,
					limit: limit.toString(),
					offset: ((page - 1) * limit).toString()
				}).toString()}`,
				{
					method: 'GET'
				}
			)
			if (!response.ok) {
				toast.warning("Error refreshing status")
				return null;
			}
			toast.success("Refreshed status")
			return response.json()
		},
		enabled: !!account.isConnected && siwe.isSignedIn
	})
	const [refreshTimeout, setRefreshTimeout] = useState(false)
	const handleRefresh = async () => {
		setRefreshTimeout(true)
		getDepositResponse.refetch()
		setTimeout(() => {
			setRefreshTimeout(false)
		}, 10_000)
	}
	if (getDepositResponse.isFetching) return <div className='text-center mt-2'>Loading...</div>
	const data = getDepositResponse.data
	if (!data?.total || !data?.deposits.length) return <div className='text-center mt-2'>No order history</div>
	const numPages = Math.ceil(data.total / limit)
	const needsRefresh = data.deposits.some((d: any) => getStatus({ btcTxid: d.btc_txid, ethTxid: d.eth_txid, expires: d.expires }) === 'In Progress');
	return (
		<>
			<div className={styles.cardsContainer}>
				{needsRefresh && (
					<div className='flex justify-around'>
						<Button variant="outline" className='flex items-center gap-1' onClick={handleRefresh} disabled={getDepositResponse.isFetching || refreshTimeout}>
							<RefreshIcon size={"1rem"} fill='white' />
							<div>Refresh Status</div>
						</Button>
					</div>
				)}
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
								expires: d.expires,
							})}
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

const CountdownTimer = ({ targetUnixTimestamp }: { targetUnixTimestamp: number }) => {
	const [timeLeft, setTimeLeft] = useState(targetUnixTimestamp - Math.floor(Date.now() / 1000))

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prevTime => {
				const updatedTime = prevTime - 1
				if (updatedTime <= 0) {
					clearInterval(timer)
					return 0
				}
				return updatedTime
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = time % 60
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	return <span>{formatTime(timeLeft)}</span>
}

export default CountdownTimer
