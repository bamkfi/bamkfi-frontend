/* eslint-disable @next/next/no-img-element */

import { Button } from '@/components/ui/button'
import TwitterIcon from '@/icons/twitter'
import TelegramIcon from '@/icons/telegram'
import GithubIcon from '@/icons/github'
import GitbookIcon from '@/icons/gitbook'
import { TWITTER_URL, TELEGRAM_URL, GITHUB_URL, GITBOOK_URL } from '@/lib/constants'
import Image from 'next/image'

export default function Footer() {
	return (
		<div className="flex flex-col md:flex-row md:justify-between items-center md:items-end mt-12 max-w-screen-xl container mb-12 pb-5 gap-8">
			<div className="relative">
				<div className="flex flex-wrap justify-center items-center gap-4 max-w-[600px] mx-auto sm:mx-0">
					<a
						href="https://www.okx.com/web3/marketplace/runes/token/BAMK%E2%80%A2OF%E2%80%A2NAKAMOTO%E2%80%A2DOLLAR/840256:35"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/okx.png"
							alt="OKX"
							width={75}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://magiceden.io/runes/BAMK%E2%80%A2OF%E2%80%A2NAKAMOTO%E2%80%A2DOLLAR"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/me.svg"
							alt="Magic Eden"
							width={130}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://unisat.io/runes/market?tick=BAMK%E2%80%A2OF%E2%80%A2NAKAMOTO%E2%80%A2DOLLAR"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/unisat.svg"
							alt="Unisat"
							width={120}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://ordinalswallet.com/collection/rune-BAMK%E2%80%A2OF%E2%80%A2NAKAMOTO%E2%80%A2DOLLAR"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/ow.png"
							alt="Ordinals Wallet"
							width={130}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://www.saturnbtc.io/app/swap/bamkofnakamotodollar-sat"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/saturn.svg"
							alt="Saturn"
							width={120}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://www.dotswap.app/swap#R_BTC_BAMK%E2%80%A2OF%E2%80%A2NAKAMOTO%E2%80%A2DOLLAR"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/dotswap.png"
							alt="Dotswap"
							width={120}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://app.liquidium.fi/lend/runes"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/liquidium.svg"
							alt="Liquidium"
							width={110}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
					<a
						href="https://btc.fluidtokens.com/swap"
						target="_blank"
						rel="noopener noreferrer"
						className="group flex-1 min-w-[120px] max-w-[33%] h-8 flex justify-center items-center"
					>
						<Image
							src="/logos/fluid.png"
							alt="FluidTokens"
							width={120}
							height={1}
							priority
							className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 h-auto"
						/>
					</a>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<a href={TWITTER_URL} target="_blank" rel="noopener noreferrer">
					<Button variant="ghost" size="icon">
						<TwitterIcon className="h-5 w-5 fill-foreground/60 hover:fill-foreground/80" />
					</Button>
				</a>
				<a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
					<Button variant="ghost" size="icon">
						<TelegramIcon className="h-6 w-6 fill-foreground/60 hover:fill-foreground/80" />
					</Button>
				</a>
				<a href={GITBOOK_URL} target="_blank" rel="noopener noreferrer">
					<Button variant="ghost" size="icon">
						<GitbookIcon className="h-6 w-6 fill-foreground/60 hover:fill-foreground/80" />
					</Button>
				</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
					<Button variant="ghost" size="icon">
						<GithubIcon className="h-6 w-6 fill-foreground/60 hover:fill-foreground/80" />
					</Button>
				</a>
			</div>
		</div>
	)
}