'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'

export default function Navigation({ links } : { links: { name: string; href: string;}[] }) {
	const pathname = usePathname()

	const RenderLink = React.useCallback(
		(props: { name: string; href: string }) => {
			if (props.href.startsWith('/')) {
				return (
					<Link
						key={props.name}
						href={props.href}
						className={classNames(
							`pb-1 transition-colors text-foreground/60 hover:text-foreground/80`, 
							{['border-b border-current border-orange-400 text-orange-400 hover:text-orange-400']: pathname?.startsWith(props.href) }
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
        <div className="inline-flex items-center gap-4 text-sm lg:gap-6 px-0">
            {links.map(l => (
                <RenderLink key={l.name} {...l} />
            ))}
        </div>
	)
}
