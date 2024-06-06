import React from 'react'
import Link from 'next/link'
import { Nunito } from 'next/font/google'

import {
	SEASON_1_BAMK_PER_BLOCK,
} from '@/lib/constants'
import BamkIcon from '@/icons/bamk'
import classNames from 'classnames'
import NusdIcon from '@/icons/nusd'
import Navigation from './navigation'
import { CustomConnectKitButton } from './ConnectKitButton'

const nunito = Nunito({ subsets: ['latin'] })

export default function Header(props: {
	data:
		| {
				nusdInfoData?: undefined
				bestHeightData?: undefined
				bamkRuneData?: undefined
				nusdRuneData?: undefined
				btcPriceData?: undefined
		  }
		| {
				nusdInfoData: {
					minted: string
				}
				bestHeightData: {
					height: number
				}
				nusdRuneData: {
					"amount": string,
					"runeid": string,
					"rune": string,
					"spacedRune": string,
					"symbol": string,
				}
				bamkRuneData: {
					tick: string;
					symbol: string;
					curPrice: number;
					changePrice: number;
					btcVolume: number;
					amountVolume: number;
					cap: string;
					capUSD: string;
					warning: boolean;
				}
				btcPriceData: {
					bitcoin: {
					  usd: number;
					}
				}
		  }
}) {
	const { data } = props

	let APY = 0;
	if (data.bamkRuneData && data.nusdRuneData && data.btcPriceData && data.nusdInfoData) {
		const usdPricePerBamk = data.bamkRuneData?.curPrice / 100_000_000 * data.btcPriceData.bitcoin.usd;
		const nusdRuneCirculating = 2_100_000_000_000_000 - Number(data.nusdRuneData.amount)
		const nusdBrc20Circulating = Number(data.nusdInfoData.minted)
		const nusdTotalCirculating = nusdRuneCirculating + nusdBrc20Circulating
		APY = usdPricePerBamk * SEASON_1_BAMK_PER_BLOCK * 144 * 365 / nusdTotalCirculating;
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex justify-between items-center h-14 max-w-screen-xl container">
				<div className="flex items-center">
					<Link href="/">
						<div className={classNames(nunito.className, "flex h-8 mr-6 gap-4")}>
							<BamkIcon className="h-8 w-8 stroke-primary" />
							<div className='uppercase text-zinc-50 text-xl leading-[31px] tracking-[0.23em]'>
								Bamk.fi
							</div>
						</div>
					</Link>
				</div>
				<div className='hidden sm:block'>
					<Navigation />
				</div>
				{APY > 0 ? (
					<div
						title="Annual Percentage Yield"
						className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center"
					>
						<div className="bg-[#F7931A] p-[0.4rem] rounded-full">
							<NusdIcon height={14} width={14} className="stroke-primary" />
						</div>
						<p>APY</p>
						<p className="text-primary font-bold">
							{`${(APY * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
						</p>
					</div>
				) : null
				}
				<CustomConnectKitButton />
			</div>
			<div className='sm:hidden container ml-2 mt-3 mb-4'>
				<Navigation />
			</div>
		</header>
	)
}
