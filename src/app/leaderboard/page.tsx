import { Nunito } from 'next/font/google'
import classNames from 'classnames'

const nunito = Nunito({ subsets: ['latin'] })

async function getData() {
	const leaderboard = await fetch('https://calhounjohn.com/reward/getLeaderboard', {
		headers: {
			Authorization: `Bearer big-bamker-password`
		},
		next: { revalidate: 600 }
	})
	if (!leaderboard.ok) {
		return {}
	}
	const leaderboard_data = (await leaderboard.json())


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

	const btcPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
		method: 'GET',
		headers: {
			'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string,
		},
		next: { revalidate: 600 }
	});
	if (!btcPrice.ok) {
		console.log(bamkRune)
		return {}
	}
	const btcPriceData: {
		bitcoin: {
		  usd: number;
		}
	 } = (await btcPrice.json());
	return {
		leaderboard_data,
		bamkRuneData,
		btcPriceData
	}
}

export default async function Leaderboard() {
	const data = await getData()
	return (
		<div className="max-w-screen-xl container flex flex-col gap-8 sm:mt-8">
			<div className="flex flex-col gap-4 mx-3 md:mx-8">
				<h1 className={classNames(nunito.className, 'text-3xl mt-2')}>
					Season 1 Airdrop Leaderboard
				</h1>
				<div>
					NUSD Rune and BRC-20 holders accrue pro-rata rewards of 31,250 BAMK per block.
				</div>
			</div>
			<div className="relative overflow-x-auto shadow-md rounded-lg">
				<table className="w-full text-sm text-left rtl:text-right text-zinc-400">
					<thead className="text-xs uppercase bg-zinc-700 text-zinc-400">
						<tr>
							<th scope="col" className="px-6 py-3">
								Rank
							</th>
							<th scope="col" className="px-6 py-3">
								Address
							</th>
							<th scope="col" className="px-6 py-3 text-right">
								Amount
							</th>
							<th scope="col" className="px-6 py-3 text-right">
								Value
							</th>
						</tr>
					</thead>
					<tbody>
						{data?.leaderboard_data?.rewards?.length > 0 ? (
							<>
								{data.leaderboard_data.rewards?.sort((a: any, b: any) => b.amount - a.amount)?.map((address: any, index: number) => 
									<tr key={address} className="border-b bg-zinc-800 border-zinc-700 hover:bg-zinc-600 font-mono">
										<td scope="row" className="px-6 py-4 whitespace-nowrap">
											{index+1}
										</td>
										<td scope="row" className="px-6 py-4 whitespace-nowrap">
											{address?.address}
										</td>
										<td className="px-6 py-4 text-right">
											{address?.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 } )}&nbsp;🏦
										</td>
										<td className="px-6 py-4 text-right">
											{(data?.btcPriceData?.bitcoin.usd && address?.amount && data.bamkRuneData.curPrice) ?
											('$' + ((address?.amount * data.bamkRuneData.curPrice) / 100000000 * data?.btcPriceData?.bitcoin.usd).toLocaleString(undefined, { maximumFractionDigits: 0 }))
											: '-'}
										</td>
									</tr> 
								)}
							</>
						) :
						<tr className="bg-zinc-800 hover:bg-zinc-600">
							<td scope="row" className="px-6 py-4 text-white">
								No data
							</td>
							<td></td>
							<td></td>
							<td></td>
						</tr>}
					</tbody>
				</table>
			</div>
			{data.leaderboard_data?.block && (
				<div className='ml-auto mr-auto text-zinc-400'>
					Leaderboard synced to block {data.leaderboard_data.block}
				</div>
			) }
		</div>
	)
}