import type { Metadata } from "next";

import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import Header from '@/components/header'
import Footer from '@/components/footer'
import classNames from 'classnames'
import { DataProvider } from "@/app/context/datacontext";
import { MagicEdenBamkData, NusdRuneData } from "@/types";
import { mulish } from "@/components/ui/fonts";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BtcWalletProvider } from "@/components/providers/BtcWalletProvider";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { SEASON_1_BAMK_PER_BLOCK } from "@/lib/constants";

export const metadata: Metadata = {
	metadataBase: new URL('https://bamk.fi'),
	title: 'BAMK•OF•NAKAMOTO•DOLLAR',
	description: 'Bitcoin synthetic dollar protocol',
	twitter: {
		card: 'summary_large_image',
		title: 'BAMK•OF•NAKAMOTO•DOLLAR',
		description: 'Bitcoin synthetic dollar protcol',
		creator: '@bamkfi',
		images: ['/unfurl.png']
	},
	openGraph: {
		images: ['/unfurl.png']
	}
}

async function getData() {
	const magicEdenBamk = await fetch('https://api-mainnet.magiceden.dev/v2/ord/btc/runes/market/BAMKOFNAKAMOTODOLLAR/info', {
		headers: {
			Authorization: `Bearer ${process.env.MAGIC_EDEN_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!magicEdenBamk.ok) {
		console.error("Error fetching magic eden bamk", magicEdenBamk.status, magicEdenBamk.statusText)
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
		console.error('Error fetching nusdRune:', nusdRune.status, nusdRune.statusText)
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
		console.error("Error fetching btcPrice", btcPrice.status, btcPrice.statusText)
		return {}
	}
	const btcPriceData: {
		bitcoin: {
		  usd: number;
		}
	 } = (await btcPrice.json());

	const nusdCirculationReq = await fetch('https://calhounjohn.com/balances/getCirculationByBlock', {
		headers: {
		  Authorization: `Bearer big-bamker-password`
		},
		next: {
		  revalidate: 600
		}
	  });
	if (!nusdCirculationReq.ok) {
		console.error("Error fetching NUSD circulation", nusdCirculationReq.status, nusdCirculationReq.statusText)
		return {};
	}
	let tvl = 0
	try {
		const nusdCirculationData = await nusdCirculationReq.json() as { circulation: number };
		if (nusdCirculationData?.circulation) {
			tvl = nusdCirculationData.circulation
		}
	} catch (err) {
		return {}
	}

	let apy = 0
	if (magicEdenBamkData && btcPriceData && tvl) {
		const usdPricePerBamk =
			(Number(magicEdenBamkData.floorUnitPrice.formatted) / 100_000_000) *
			btcPriceData.bitcoin.usd
		apy = (usdPricePerBamk * SEASON_1_BAMK_PER_BLOCK * 144 * 365) / tvl
	}
	
	return {
		nusdRuneData,
		magicEdenBamkData,
		btcPriceData,
		apy,
		tvl,
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
					<DataProvider data={data}>
						<BtcWalletProvider>
							<Web3Provider>
								<Header/>
								<main className="flex-[1_1_auto]">
									{children}
								</main>
								<Footer />
								<ToastContainer theme="dark" position="bottom-center" newestOnTop hideProgressBar closeButton={false} className="mb-4" />
							</Web3Provider>
						</BtcWalletProvider>
					</DataProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
