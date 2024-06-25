'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
    GITBOOK_URL,
} from '@/lib/constants'
import classNames from 'classnames'

export default function Navigation() {
	const pathname = usePathname()

	const links = React.useMemo(() => {
		return [
			{
				name: 'Mint',
				href: '/mint'
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
			{
				name: 'News',
				href: '/news'
			},
		]
	}, [])

	const RenderLink = React.useCallback(
		(props: { name: string; href: string }) => {
			if (props.href.startsWith('/')) {
				return (
					<Link
						key={props.name}
						href={props.href}
						className={classNames(
							`pb-1 transition-colors text-foreground/60 hover:text-foreground/80`, 
							{['border-b border-current border-orange-400 text-orange-400 hover:text-orange-400']: props.href === pathname }
						)}
					>
						{props.name}
					</Link>
				)
			}

			return (
				<a
					key={props.name}
					href={props.href}
					className="pb-1 transition-colors text-foreground/60 hover:text-foreground/80 "
					target="_blank"
					rel="noopener noreferrer"
				>
					{props.name}
				</a>
			)
		},
		[pathname]
	)

	return (
        <div className="inline-flex items-center gap-4 text-sm lg:gap-6 px-1 w-fit">
            {links.map(l => (
                <RenderLink key={l.name} {...l} />
            ))}
        </div>
	)
}
