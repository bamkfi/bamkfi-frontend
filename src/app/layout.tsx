import type { Metadata } from "next";
import { Mulish } from 'next/font/google';

import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import Header from '@/components/header'
import Footer from '@/components/footer'
import classNames from 'classnames'
import { DataProvider } from "@/app/context/datacontext";
import { UnisatBamkData, MagicEdenBamkData, NusdRuneData } from "@/types";
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
		console.error("Error fetching NUSD BRC20 data from unisat", nusdInfo)
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
		console.error("Error fetching best brc20 height", bestHeight)
		return {}
	}
	const bestHeightData: { height: number } = (await bestHeight.json()).data;

	const unisatBamkReq = await fetch('https://open-api.unisat.io/v3/market/runes/auction/runes_types_specified', {
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
	if (!unisatBamkReq.ok) {
		console.error("Error fetching unisat bamk", unisatBamkReq)
		return {}
	}
	const unisatBamkData: UnisatBamkData = (await unisatBamkReq.json()).data;


	const magicEdenBamk = await fetch('https://api-mainnet.magiceden.dev/v2/ord/btc/runes/market/BAMKOFNAKAMOTODOLLAR/info', {
		headers: {
			Authorization: `Bearer ${process.env.MAGIC_EDEN_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!magicEdenBamk.ok) {
		console.error("Error fetching magic eden bamk", magicEdenBamk)
		return {}
	}
	const magicEdenBamkData: MagicEdenBamkData = (await magicEdenBamk.json())

	const nusdRune = await fetch('https://open-api.unisat.io/v1/indexer/address/bc1pg9afu20tdkmzm40zhqugeqjzl5znfdh8ndns48t0hnmn5gu7uz5saznpu9/runes/845005%3A178/balance', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
		},
		next: { revalidate: 600 }
	});
	if (!nusdRune.ok) {
		console.error('Error fetching nusdRune:', nusdRune)
		return {}
	}
	const nusdRuneData: NusdRuneData = (await nusdRune.json()).data;

	const btcPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
		method: 'GET',
		headers: {
			'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string,
		},
		next: { revalidate: 600 }
	});
	if (!btcPrice.ok) {
		console.error("Error fetching btcPrice", btcPrice)
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
		unisatBamkData,
		magicEdenBamkData,
		btcPriceData,
	}
}

export type AppData = Awaited<ReturnType<typeof getData>>

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
						<DataProvider data={data}>
							<Header data={data} />
							<main className="flex-[1_1_auto]">
								{children}
							</main>
							<Footer />
						</DataProvider>
					</Web3Provider>
				</ThemeProvider>
			</body>
		</html>
	)
}
