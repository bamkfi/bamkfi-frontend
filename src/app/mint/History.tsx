import { GetDepositResponse } from '../../lib/autoswap'
import { useQuery } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSIWE } from 'connectkit'
import styles from './History.module.css'
import React from 'react'
import NUSDIcon from '../../icons/nusd'
import { Grid, GridProps } from 'react-loader-spinner'
import { explorerLink, isExpired } from '../../utils'
import { Button } from '../../components/ui/button'
import { CaretUpIcon } from '../../icons/CaretUpIcon'
import { CircleCheckIcon } from '../../icons/CircleCheckIcon'
import { WarningOutlineIcon } from '../../icons/WarningOutlineIcon'
import BtcIcon from '@/icons/btc'
import EthIcon from '@/icons/eth'

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

const ChainLogo = (props: { chain: 'btc' | 'eth' | null }) => {
	if (props.chain === 'btc') return <BtcIcon width={20} height={20} />
	if (props.chain === 'eth') return <EthIcon width={20} height={20} />
	return null
}

const TransactionLink = (props: { txid: string | null; network: 'eth' | 'btc' | null }) => {
	if (!props.txid || !props.network)
		return (
			<div className={styles.currencyValueContainer}>
				<GridSpinner color="white" />
				<div className={styles.txid}>Awaiting confirmation...</div>
			</div>
		)
	const href = explorerLink(props.network, props.txid)
	return (
		<div className={styles.currencyValueContainer}>
			<div className={styles.networkTag}>
				<ChainLogo chain={props.network} />
			</div>
			<a href={href} rel="noopener noreferrer" target="_blank" className={styles.txid}>
				{props.txid}
			</a>
		</div>
	)
}

const MintHistoryCard: React.FC<GetDepositResponse['deposits'][number]> = props => {
	const [expanded, setExpanded] = useState(false)
	let status: 'Minted' | 'Minting' | 'Expired' | 'Confirming Deposit'
	if (props.btc_reveal_txid) {
		status = 'Minted'
	} else if (props.btc_inscribe_txid || props.eth_txid) {
		status = 'Minting'
	} else if (isExpired(props.expires)) {
		status = 'Expired'
	} else {
		status = 'Confirming Deposit'
	}
	const statusClass = status === 'Minted' ? 'success' : status === 'Expired' ? 'error' : 'normal'
	return (
		<div key={props.expires} className={styles.card}>
			<div className={styles.cardTitle}>
				{(status === 'Minting' || status === 'Confirming Deposit') && (
					<GridSpinner height="1.5rem" width="1.5rem" color="white" />
				)}
				{status === 'Minted' && <CircleCheckIcon size="1.5rem" fill="rgb(60, 179, 113)" />}
				{status === 'Expired' && <WarningOutlineIcon size="1.5rem" fill="rgb(205, 92, 92)" />}
				<div className={styles[statusClass]}>{status}</div>
			</div>
			<div className={styles.labeledValuesContainer}>
				<div>
					{/* <div className={styles.label}>Amount</div> */}
					<div className={styles.currencyValueContainer}>
						<NUSDIcon />
						{(Number(props.from_usde_amount) / 10 ** 18).toLocaleString()} NUSD
					</div>
				</div>
				<div>
					<div className={styles.label}>To Address</div>
					<div className={styles.currencyValueContainer}>
						<div className={styles.networkTagWrapper}>
							<div className={styles.networkTag}>
								<ChainLogo chain={'btc'} />
							</div>{' '}
						</div>
						{props.to_btc_address}
					</div>
				</div>
				{expanded ? (
					<div className={styles.expanded}>
						<hr />
						<div>
							<div className={styles.label}>Deposit Transaction</div>
							<TransactionLink network="eth" txid={props.eth_txid} />
						</div>
						<div>
							<div className={styles.label}>Mint Commit Transaction</div>
							<TransactionLink network="btc" txid={props.btc_inscribe_txid} />
						</div>
						<div>
							<div className={styles.label}>Mint Reveal Transaction</div>
							<TransactionLink network="btc" txid={props.btc_reveal_txid} />
						</div>
						<button className={styles.iconButton} onClick={() => setExpanded(false)}>
							<CaretUpIcon size={'24px'} fill="white" />
						</button>
					</div>
				) : (
					<>
						<button className={styles.iconButton} onClick={() => setExpanded(true)}>
							View Details
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export const MintHistory: FC = () => {
	const account = useAccount()
	const siwe = useSIWE()
	const [page, setPage] = useState(1)
	const limit = 10
	const getDepositResponse = useQuery<GetDepositResponse>({
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
				throw new Error('Deposit history response was not ok')
			}
			return response.json()
		},
		enabled: !!account.isConnected && siwe.isSignedIn
	})
	if (!getDepositResponse.isFetched) return null
	const data = getDepositResponse.data
	if (!data?.deposits.length) return null
	const numPages = Math.ceil(data.total / limit)
	return (
		<>
			<hr className={styles.hrOuter} />
			<div className={styles.cardsContainer}>
				{data.deposits.map(d => (
					<div key={d.expires} className={styles.cardWrapper}>
						<MintHistoryCard {...d} />
					</div>
				))}
			</div>
			<div className={styles.pages}>
				<Button
					variant="outline"
					onClick={() => page > 0 && setPage(page - 1)}
					disabled={page === 1 || getDepositResponse.isFetching}
				>
					&lt; Previous
				</Button>
				<Button
					variant="outline"
					onClick={() => page < numPages && setPage(page + 1)}
					disabled={page === numPages || getDepositResponse.isFetching}
				>
					Next &gt;
				</Button>
			</div>
		</>
	)
}
