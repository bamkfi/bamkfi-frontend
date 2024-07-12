'use client'

import React from 'react'
import Link from 'next/link'

import { GITBOOK_URL } from '@/lib/constants'
import BamkIcon from '@/icons/bamk'
import classNames from 'classnames'
import NusdIcon from '@/icons/nusd'
import Navigation from './navigation/navigation'
import { nunito } from './ui/fonts'
import { Button } from './ui/button'
import { usePathname } from 'next/navigation'
import { Wallets } from './wallet/Wallets'
import {MobileNavigation} from './navigation/navigation'
import { useData } from '@/app/context/datacontext'

export default function Header() {
	const data = useData()
	const isHomepage = usePathname() === '/'

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
			}
		]
	}, [])

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex justify-between items-center h-14 max-w-screen-xl container px-2 sm:px-8">
				<div className="flex items-center">
					<Link href="/home">
						<div className={classNames(nunito.className, 'flex h-8 mr-2 gap-4')}>
							<BamkIcon className="h-8 w-8 stroke-primary" />
							<div className="uppercase text-zinc-50 text-xl leading-[31px] tracking-[0.23em]">
								Bamk.fi
							</div>
						</div>
					</Link>
				</div>
				<div className="hidden sm:block">
					<Navigation links={links} />
				</div>
				{data.apy && data.apy > 0 ? (
					<div
						title="Annual Percentage Yield"
						className="bg-primary/5 text-sm gap-2 px-4 rounded-md h-10 items-center hidden lg:flex"
					>
						<div className="bg-[#F7931A] p-[0.4rem] rounded-full">
							<NusdIcon height={14} width={14} className="stroke-primary" />
						</div>
						<p>APY</p>
						<p className="text-primary font-bold">
							{`${(data.apy * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
						</p>
					</div>
				) : null}
				<div className='flex items-center gap-2'>
					{isHomepage ? (
						<div>
							<Link href="/swap">
								<Button>
									<div className="font-semibold">Launch App</div>
								</Button>
							</Link>
						</div>
					) : (
						<Wallets />
					)}
					<div className='sm:hidden'>
						<MobileNavigation links={[{ name: 'Home',	href: '/home' }, ...links]} />
					</div>
				</div>
			</div>
		</header>
	)
}
