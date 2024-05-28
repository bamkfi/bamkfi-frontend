import { Button } from '@/components/ui/button'
import { Nunito } from 'next/font/google'
import classNames from 'classnames'
import {
	BAMK_MARKET_URL,
	BAMK_PREMINED_SUPPLY,
	BAMK_TOTAL_SUPPLY,
	ETHENA_SUSDE_BACKING_ACCOUNT,
	ETHENA_SUSDE_TOKEN_CONTRACT,
	NUSD_MARKET_URL,
	NUSD_RUNE_MARKET_URL
} from '@/lib/constants'
import { Fitty } from '@/components/ui/fitty'

const nunito = Nunito({ subsets: ['latin'] })

async function getData() {
	const nusdInfo = await fetch('https://open-api.unisat.io/v1/indexer/brc20/$NUSD/info', {
		headers: {
			Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!nusdInfo.ok) {
		console.log(nusdInfo)
		return {}
	}
	const nusdInfoData: { minted: string } = (await nusdInfo.json()).data

	const bamkRune = await fetch(
		'https://open-api.unisat.io/v3/market/runes/auction/runes_types_specified',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
			},
			body: JSON.stringify({
				tick: 'BAMK•OF•NAKAMOTO•DOLLAR',
				timeType: 'day1'
			}),
			next: { revalidate: 600 }
		}
	)
	if (!bamkRune.ok) {
		console.log(bamkRune)
		return {}
	}
	const bamkRuneData: {
		tick: string
		symbol: string
		curPrice: number // in sats
		changePrice: number
		btcVolume: number
		amountVolume: number
		cap: string
		capUSD: string
		warning: boolean
	} = (await bamkRune.json()).data

	const nusdRune = await fetch(
		'https://open-api.unisat.io/v1/indexer/address/bc1pg9afu20tdkmzm40zhqugeqjzl5znfdh8ndns48t0hnmn5gu7uz5saznpu9/runes/845005%3A178/balance',
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
			},
			next: { revalidate: 600 }
		}
	)
	if (!nusdRune.ok) {
		console.log('error fetching nusdRune:', nusdRune)
		return {}
	}
	const nusdRuneData: {
		amount: string
		runeid: string
		rune: string
		spacedRune: string
		symbol: string
	} = (await nusdRune.json()).data

	const INFURA_API_KEY = process.env.INFURA_API_KEY
	const data = {
		jsonrpc: '2.0',
		method: 'eth_call',
		params: [
			{
				to: ETHENA_SUSDE_TOKEN_CONTRACT,
				data: '0x70a08231000000000000000000000000' + ETHENA_SUSDE_BACKING_ACCOUNT.substring(2) // balanceOf method hash + address without '0x'
			},
			'latest'
		],
		id: 1
	}
	const susdeBackingResponse = await fetch(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		next: { revalidate: 600 }
	})
	const susdeBalance = BigInt((await susdeBackingResponse.json()).result) / BigInt(10 ** 18)
	const susdePrice = await fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=ethena-staked-usde&vs_currencies=usd',
		{
			method: 'GET',
			headers: {
				'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string
			},
			next: { revalidate: 600 }
		}
	)
	if (!susdePrice.ok) {
		console.log(bamkRune)
		return {}
	}
	const susdePriceData: {
		'ethena-staked-usde': {
			usd: number
		}
	} = await susdePrice.json()
	const susdeBackingUSDValue = susdePriceData['ethena-staked-usde'].usd * Number(susdeBalance)

	return {
		nusdInfoData,
		nusdRuneData,
		bamkRuneData,
		susdeBackingUSDValue
	}
}

export default async function Home() {
	const data = await getData()
	let TVL = 0
	if (data.nusdRuneData && data.nusdInfoData) {
		const nusdRuneCirculating = 2_100_000_000_000_000 - Number(data.nusdRuneData.amount)
		const nusdBrc20Circulating = Number(data.nusdInfoData.minted)
		TVL = nusdRuneCirculating + nusdBrc20Circulating
	}
	return (
		<div className="max-w-screen-xl container flex flex-col gap-8 mt-8">
			<div className="flex flex-col gap-4 md:ml-12">
				{/* <div className="flex items-center gap-4">
					<div className="rounded-full bg-secondary flex p-8 border-2 border-[#F3E9DD4D]">
						<NusdIcon className="h-14 w-14 stroke-primary" />
					</div>
					<h1 className="text-4xl">NUSD</h1>
				</div> */}
				<h1 className={classNames(nunito, 'max-w-full w-[520px] mt-2 break-words')}>
					<Fitty>BAMK•OF•NAKAMOTO•DOLLAR</Fitty>
				</h1>
				{data.bamkRuneData ? (
					<div className="flex gap-2 flex-wrap -mt-2">
						<div
							title="BAMK Price"
							className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
						>
							<p>
								<span className="text-primary">{data.bamkRuneData.curPrice} sats</span>
								{' /🏦'}
							</p>
						</div>
						<div
							title="Market Cap (Circulating Supply)"
							className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
						>
							<p>MCAP</p>
							<p className="text-primary font-bold">
								{`$${(
									Number(data.bamkRuneData?.capUSD) *
									(1 - BAMK_PREMINED_SUPPLY / BAMK_TOTAL_SUPPLY)
								).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
							</p>
						</div>
						<div
							title="Fully Diluted Valuation"
							className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
						>
							<p>FDV</p>
							<p className="text-primary font-bold">
								{`$${Number(data.bamkRuneData?.capUSD).toLocaleString(undefined, {
									maximumFractionDigits: 0
								})}`}
							</p>
						</div>
						{TVL > 0 && (
							<div
								title="Total Value Locked"
								className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
							>
								<p>NUSD TVL</p>
								<p className="text-primary font-bold">${TVL.toLocaleString()}</p>
							</div>
						)}
						{data.susdeBackingUSDValue > 0 && (
							<a
								href={`https://etherscan.io/token/${ETHENA_SUSDE_TOKEN_CONTRACT}?a=${ETHENA_SUSDE_BACKING_ACCOUNT}`}
								className="cursor-pointer"
								target="_blank"
								rel="noopener noreferrer"
							>
								<div
									title="Backed by Ethena sUSDe"
									className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
								>
									<p>USDe Reserves</p>
									<p className="text-primary font-bold">
										$
										{data.susdeBackingUSDValue.toLocaleString(undefined, {
											maximumFractionDigits: 0
										})}
									</p>
								</div>
							</a>
						)}
					</div>
				) : null}
				<h2 className="max-w-full w-[800px] leading-7">
					Bamk.fi is a synthetic dollar protocol built on Bitcoin L1 providing a crypto-native
					solution for money not reliant on the traditional banking system, alongside a globally
					accessible dollar-denominated savings instrument — the Bitcoin&nbsp;Bond.
				</h2>
				{/* <h2 className="max-w-full w-[612px] leading-7">
					Season 0 was a public mint starting at block {840280}. 6.25% of $BAMK supply was free to inscribe.
				</h2>
				<h2 className="max-w-full w-[612px] leading-7">
					Welcome to Season 1. Starting with the first public purchase of $NUSD at block {SEASON_1_GENESIS_BLOCK}, holders of $NUSD are allocated 6.25% of supply ({SEASON_1_BAMK_PER_BLOCK.toLocaleString()} $BAMK per block) proportionally based on their $NUSD holdings. Season 1 ends at block {SEASON_1_GENESIS_BLOCK + SEASON_1_TOTAL_BLOCKS}.
				</h2> */}
				<div className="grid grid-cols-1 gap-3 max-w-full w-full sm:grid-cols-3 sm:grid-rows-1 sm:w-[800px]">
					<a
						href={BAMK_MARKET_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="col-span-1"
					>
						<Button className="w-full h-14 text-lg">Buy BAMK</Button>
					</a>
					<a
						href={NUSD_MARKET_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="col-span-1"
					>
						<Button className="w-full h-14 text-lg" variant="secondary">
							Buy NUSD (BRC-20)
						</Button>
					</a>
					<a
						href={NUSD_RUNE_MARKET_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="col-span-1 sm:col-start-3 sm:row-start-1"
					>
						<Button className="w-full h-14 text-lg" variant="secondary">
							Buy NUSD (Runes)
						</Button>
					</a>
				</div>
			</div>
		</div>
	)
}
