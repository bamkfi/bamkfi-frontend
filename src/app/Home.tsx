import { keccak256, hexToNumberString } from 'web3-utils';
import { Button } from '@/components/ui/button'
import {
	BAMK_MARKET_URL,
	BAMK_PREMINED_SUPPLY,
	BAMK_TOTAL_SUPPLY,
	ETHENA_BACKING_ACCOUNT,
	ETHENA_SUSDE_TOKEN_CONTRACT,
	ETHENA_USDE_TOKEN_CONTRACT,
	SEASON_1_BAMK_PER_BLOCK,
} from '@/lib/constants'
import { MagicEdenBamkData, NusdRuneData } from '@/types'
import { RuneNameHeading } from '@/components/ui/RuneNameHeading';
import UsdeIcon from '@/icons/USDe';
import NusdIcon from '@/icons/nusd';

async function getData() {
	const nusdInfo = await fetch('https://open-api.unisat.io/v1/indexer/brc20/$NUSD/info', {
		headers: {
			Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!nusdInfo.ok) {
		console.error('Error fetching nusdInfo', nusdInfo.status, nusdInfo.statusText)
		return {}
	}
	const nusdInfoData: { minted: string } = (await nusdInfo.json()).data

	const magicEdenBamkReq = await fetch('https://api-mainnet.magiceden.dev/v2/ord/btc/runes/market/BAMKOFNAKAMOTODOLLAR/info', {
		headers: {
			Authorization: `Bearer ${process.env.MAGIC_EDEN_API_KEY}`
		},
		next: { revalidate: 600 }
	})
	if (!magicEdenBamkReq.ok) {
		console.error('Error fetching magicEdenBamkReq', magicEdenBamkReq.status, magicEdenBamkReq.statusText)
		return {}
	}
	const magicEdenBamkData: MagicEdenBamkData = (await magicEdenBamkReq.json())

	const nusdRune = await fetch(
		'https://open-api.unisat.io/v1/indexer/address/bc1pg9afu20tdkmzm40zhqugeqjzl5znfdh8ndns48t0hnmn5gu7uz5saznpu9/runes/845005%3A178/balance',
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${process.env.UNISAT_API_KEY}`
			},
			next: { revalidate: 600 }
		}
	)
	if (!nusdRune.ok) {
		console.error('Error fetching nusdRune:', nusdRune.status, nusdRune.statusText)
		return {}
	}
	const nusdRuneData: NusdRuneData = (await nusdRune.json()).data

	const INFURA_API_KEY = process.env.INFURA_API_KEY

	const erc20BalanceOfMethodId = '0x70a08231000000000000000000000000'
	const usdeBackingResponse = await fetch(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'eth_call',
			params: [
				{
					to: ETHENA_USDE_TOKEN_CONTRACT,
					data: erc20BalanceOfMethodId + ETHENA_BACKING_ACCOUNT.substring(2)
				},
				'latest'
			],
			id: 1
		}),
		next: { revalidate: 600 }
	})
	if (!usdeBackingResponse.ok) {
		console.error('Error fetching usdeBacking', usdeBackingResponse.status, usdeBackingResponse.statusText)
	}
	const usdeBalance = BigInt((await usdeBackingResponse.json()).result) / BigInt(10 ** 18)
	const usdePrice = await fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=ethena-usde&vs_currencies=usd',
		{
			method: 'GET',
			headers: {
				'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string
			},
			next: { revalidate: 600 }
		}
	)
	if (!usdePrice.ok) {
		console.error('Error fetching usdePrice', usdePrice)
		return {}
	}
	const usdePriceData: {
		'ethena-usde': {
			usd: number
		}
	} = await usdePrice.json()

	const susdeBackingResponse = await fetch(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'eth_call',
			params: [
				{
					to: ETHENA_SUSDE_TOKEN_CONTRACT,
					data: erc20BalanceOfMethodId + ETHENA_BACKING_ACCOUNT.substring(2)
				},
				'latest'
			],
			id: 1
		}),
		next: { revalidate: 600 }
	})
	if (!susdeBackingResponse.ok) {
		console.error('Error fetching susdeBacking', susdeBackingResponse.status, susdeBackingResponse.statusText)
	}
	const susdeBalance = BigInt((await susdeBackingResponse.json()).result) / BigInt(10 ** 18)
	const susdePrice = await fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=ethena-staked-usde&vs_currencies=usd',
		{
			method: 'GET',
			headers: {
				'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string
			},
			next: { revalidate: 600 }
		}
	)
	if (!susdePrice.ok) {
		console.error('Error fetching susdePrice', susdePrice)
		return {}
	}
	const susdePriceData: {
		'ethena-staked-usde': {
			usd: number
		}
	} = await susdePrice.json()

	let usdeUnstakingBalance = 0;
	const methodSignature = 'cooldowns(address)';
	const methodId = keccak256(methodSignature).substring(0, 10);
	const paddedAddress = ETHENA_BACKING_ACCOUNT.toLowerCase().replace('0x', '').padStart(64, '0');
	const susdeUnstakingResponse = await fetch(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'eth_call',
			params: [{
				to: ETHENA_SUSDE_TOKEN_CONTRACT,
				data: `${methodId}${paddedAddress}`
			}, 'latest'],
			id: 1
		}),
		next: { revalidate: 600 }
	});
	
	if (!susdeUnstakingResponse.ok) {
		console.error("Error fetching susdeUnstakingResponse", susdeUnstakingResponse.status, susdeUnstakingResponse.statusText);
		return {}
	}
	const responseJson = await susdeUnstakingResponse.json();
	const result = responseJson.result;
	if (result) {
		const cooldownEndDate = new Date(Number(hexToNumberString(result.slice(0, 66))) * 1000);
		const underlyingAmount = hexToNumberString('0x' + result.slice(66));
		usdeUnstakingBalance = Number(underlyingAmount) / 10 ** 18;
	} else {
		console.error('Error fetching cooldown amount', responseJson);
		return {}
	}

	const susdeValue = susdePriceData['ethena-staked-usde'].usd * Number(susdeBalance);
	const usdeValue = usdePriceData['ethena-usde'].usd * Number(usdeBalance);
	const usdeUnstakingValue = usdePriceData['ethena-usde'].usd * usdeUnstakingBalance;
	const susdeBackingUSDValue = susdeValue + usdeValue + usdeUnstakingValue;
	const btcPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
		method: 'GET',
		headers: {
			'x-cg-demo-api-key': process.env.COINGECKO_API_KEY as string,
		},
		next: { revalidate: 600 }
	});
	if (!btcPrice.ok) {
		console.error("Error fetching BTC price", btcPrice.status, btcPrice.statusText)
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
	if (magicEdenBamkData && nusdRuneData && btcPriceData && nusdInfoData) {
		const usdPricePerBamk =
			(Number(magicEdenBamkData.floorUnitPrice.formatted) / 100_000_000) *
			btcPriceData.bitcoin.usd
		const nusdRuneCirculating = 2_100_000_000_000_000 - Number(nusdRuneData.amount)
		const nusdBrc20Circulating = Number(nusdInfoData.minted)
		const nusdTotalCirculating = nusdRuneCirculating + nusdBrc20Circulating
		apy = (usdPricePerBamk * SEASON_1_BAMK_PER_BLOCK * 144 * 365) / nusdTotalCirculating
	}

	return {
		nusdInfoData,
		nusdRuneData,
		magicEdenBamkData,
		susdeBackingUSDValue,
		btcPriceData,
		tvl,
		apy
	}
}

export default async function Home() {
	const data = await getData()
	return (
        <div className="flex flex-col h-full">
			<div className="flex-grow">    
				<div className="max-w-screen-xl container flex flex-col gap-8 mt-8">
					<div className="flex flex-col gap-4 md:ml-12">
						<RuneNameHeading>BAMK•OF•NAKAMOTO•DOLLAR</RuneNameHeading>
						{data?.magicEdenBamkData ? (
							<div className="flex gap-2 flex-wrap -mt-2">
								<div
									title="BAMK Price"
									className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
								>
									<p>
										<span className="text-primary">{Number(data.magicEdenBamkData.floorUnitPrice.formatted).toLocaleString(undefined, { maximumFractionDigits: 2 })} sats</span>
										{' / 🏦'}
									</p>
								</div>
								<div
									title="Market Cap (Circulating Supply)"
									className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
								>
									<p>🏦 MCAP</p>
									<p className="text-primary font-bold">
										{`$${(
											Number(data.magicEdenBamkData.marketCap) * data.btcPriceData.bitcoin.usd *
											(1 - BAMK_PREMINED_SUPPLY / BAMK_TOTAL_SUPPLY)
										).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
									</p>
								</div>
								<div
									title="Fully Diluted Valuation"
									className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
								>
									<p>🏦 FDV</p>
									<p className="text-primary font-bold">
										{`$${(Number(data.magicEdenBamkData.marketCap) * data.btcPriceData.bitcoin.usd).toLocaleString(undefined, {
											maximumFractionDigits: 0
										})}`}
									</p>
								</div>
								{data.tvl && data.tvl > 0 ? (
									<div
										title="Total Value Locked"
										className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
									>
										<div className="bg-[#F7931A] p-[0.4rem] rounded-full">
										<NusdIcon height={14} width={14} className="stroke-primary" />
										</div>
										<p>TVL</p>
										<p className="text-primary font-bold">${data.tvl.toLocaleString()}</p>
									</div>
								) : null}
								{data.susdeBackingUSDValue > 0 && (
									<a
										href={`https://www.oklink.com/eth/token/${ETHENA_SUSDE_TOKEN_CONTRACT}?address=${ETHENA_BACKING_ACCOUNT}`}
										className="cursor-pointer"
										target="_blank"
										rel="noopener noreferrer"
									>
										<div
											title="Backed by Ethena USDe/sUSDe"
											className="bg-primary/5 flex text-sm gap-2 px-4 rounded-md h-10 items-center w-max mt-1"
										>
											<UsdeIcon height={27} width={27} className="stroke-primary" />
											<p>USDe Reserves</p>
											<p className="text-primary font-bold">
												$
												{data.susdeBackingUSDValue.toLocaleString(undefined, {
													maximumFractionDigits: 0
												})}
											</p>
										</div>
									</a>
								)}
								{data.apy && data.apy > 0 ? (
									<div
										title="Annual Percentage Yield"
										className="bg-primary/5 text-sm gap-2 px-4 rounded-md h-10 items-center flex mt-1 lg:hidden"
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
							</div>
						) : null}
						<h2 className="max-w-full w-[612px] leading-7">
							Bamk.fi is a synthetic dollar protocol built on Bitcoin L1 providing a crypto-native
							solution for money not reliant on the traditional banking system, alongside a globally
							accessible dollar-denominated savings instrument — the Bitcoin&nbsp;Bond.
						</h2>
						<div className="flex flex-wrap gap-3 max-w-full sm:w-[612px]">
							<a
								href={BAMK_MARKET_URL}
								target="_blank"
								rel="noopener noreferrer"
								className='flex-grow'
							>
								<Button className="w-full h-14 text-lg">Buy BAMK</Button>
							</a>
							<a
								href={"https://www.dotswap.app/swap#R_BTC_NUSD%E2%80%A2NUSD%E2%80%A2NUSD%E2%80%A2NUSD"}
								target="_blank"
								rel="noopener noreferrer"
								className='flex-grow'
							>
								<Button className="w-full h-14 text-lg" variant="secondary">
									Buy NUSD
								</Button>
							</a>
						</div>
					</div>
				</div>
        	</div>
        </div>
	)
}