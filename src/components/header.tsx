import React from 'react'
import Link from 'next/link'

import {
	GITBOOK_URL,
	SEASON_1_BAMK_PER_BLOCK,
} from '@/lib/constants'
import BamkIcon from '@/icons/bamk'
import classNames from 'classnames'
import NusdIcon from '@/icons/nusd'
import Navigation from './navigation'
import { AppData } from '@/app/layout'
import { nunito } from './ui/fonts'

export default function Header(props: {
	data: AppData
}) {
	const { data } = props

	let APY = 0;
	if (data.magicEdenBamkData && data.nusdRuneData && data.btcPriceData && data.nusdInfoData) {
		const usdPricePerBamk = Number(data.magicEdenBamkData.floorUnitPrice.formatted) / 100_000_000 * data.btcPriceData.bitcoin.usd;
		const nusdRuneCirculating = 2_100_000_000_000_000 - Number(data.nusdRuneData.amount)
		const nusdBrc20Circulating = Number(data.nusdInfoData.minted)
		const nusdTotalCirculating = nusdRuneCirculating + nusdBrc20Circulating
		APY = usdPricePerBamk * SEASON_1_BAMK_PER_BLOCK * 144 * 365 / nusdTotalCirculating;
	}

	const links = React.useMemo(() => {
		return [
			{
				name: 'Swap',
				href: '/swap'
			},
			{
				name: 'Leaderboard',
				href: '/leaderboard'
			},
			{
				name: 'Calculator',
				href: '/calculator'
			},
			{
				name: 'Docs',
				href: GITBOOK_URL
			},
		]
	}, [])

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex justify-between items-center h-14 max-w-screen-xl container px-2 sm:px-8">
				<div className="flex items-center">
					<Link href="/">
						<div className={classNames(nunito.className, "flex h-8 mr-2 gap-4")}>
							<BamkIcon className="h-8 w-8 stroke-primary" />
							<div className='uppercase text-zinc-50 text-xl leading-[31px] tracking-[0.23em]'>
								Bamk.fi
							</div>
						</div>
					</Link>
				</div>
				<div className='hidden sm:block'>
					<Navigation links={links} />
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
			</div>
			<div className='sm:hidden inline-flex container ml-2 mt-3 mb-4 w-fit pl-2 pr-0'>
				<Navigation links={links} />
			</div>
		</header>
	)
}
