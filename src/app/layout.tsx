import type { Metadata } from "next";
import { Mulish } from 'next/font/google';

import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import Header from '@/components/header'
import Footer from '@/components/footer'
import classNames from 'classnames'
import { Web3Provider } from "@/components/providers/Web3Provider";

const mulish = Mulish({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'BAMK•OF•NAKAMOTO•DOLLAR',
	description: 'Bitcoin synthetic dollar protocol',
	twitter: {
		card: 'summary_large_image',
		title: 'BAMK•OF•NAKAMOTO•DOLLAR',
		description: 'Bitcoin synthetic dollar protcol',
		creator: '@bamkfi',
		images: ['https://bamkfi-fontend.vercel.app/unfurl.png']
	},
	openGraph: {
		images: ['https://bamkfi-fontend.vercel.app/unfurl.png']
	}
}

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

	const bestHeight = await fetch('https://open-api.unisat.io/v1/indexer/brc20/bestheight', {
		headers: {
			Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!bestHeight.ok) {
		console.log(bestHeight)
		return {}
	}
	const bestHeightData: { height: number } = (await bestHeight.json()).data;

	const bamkRune = await fetch('https://open-api.unisat.io/v3/market/runes/auction/runes_types_specified', {
		method: 'POST',
		headers: {
		  "Content-Type": "application/json",
		  Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
		},
		body: JSON.stringify({
			tick: 'BAMK•OF•NAKAMOTO•DOLLAR',
			timeType: 'day1',
		}),
		next: { revalidate: 600 }
	});
	if (!bamkRune.ok) {
		console.log(bamkRune)
		return {}
	}
	const bamkRuneData: {
		tick: string;
		symbol: string;
		curPrice: number; // in sats
		changePrice: number;
		btcVolume: number;
		amountVolume: number;
		cap: string;
		capUSD: string;
		warning: boolean;
	} = (await bamkRune.json()).data;

	const nusdRune = await fetch('https://open-api.unisat.io/v1/indexer/address/bc1pg9afu20tdkmzm40zhqugeqjzl5znfdh8ndns48t0hnmn5gu7uz5saznpu9/runes/845005%3A178/balance', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
		},
		next: { revalidate: 600 }
	});
	if (!nusdRune.ok) {
		console.log('error fetching nusdRune:', nusdRune)
		return {}
	}
	const nusdRuneData: {
		"amount": string,
		"runeid": string,
		"rune": string,
		"spacedRune": string,
		"symbol": string,
	} = (await nusdRune.json()).data;

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
		nusdInfoData,
		nusdRuneData,
		bestHeightData,
		bamkRuneData,
		btcPriceData,
	}
}

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const data = await getData()

	return (
		<html lang="en" className="h-full">
			<body className={classNames(mulish.className, 'flex flex-col h-full')}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<Web3Provider>
						<Header data={data} />
						<main className="flex-[1_1_auto]">
							{children}
						</main>
						<Footer />
					</Web3Provider>
				</ThemeProvider>
			</body>
		</html>
	)
}
