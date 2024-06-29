'use client';

import { useData } from '@/app/context/datacontext';
import { useState } from 'react';
import InfoIcon from '@/icons/info'

export default function Calculator() {
  const {
	  magicEdenBamkData,
    nusdInfoData,
    nusdRuneData,
    btcPriceData,
  } = useData();
  let initialTotalNusd = 2000000; // Default value if totalNusd is not available
  let initialBamkPrice = 0;

  if (nusdRuneData && nusdInfoData) {
    initialTotalNusd = (2100000000000000 - Number(nusdRuneData.amount)) + Number(nusdInfoData.minted);
  }

  if (magicEdenBamkData) {
    initialBamkPrice = Number(magicEdenBamkData.floorUnitPrice.formatted);
  }

  const [walletNusd, setMyNusd] = useState<number>(2000);
  const [poolNusd, setPoolNusd] = useState<number>(0);
  const [liquidityPoolPercent, setLiquidityPoolPercent] = useState<number>(0);
  const [totalNusd, setTotalNusd] = useState<number>(initialTotalNusd);
  const [bamkPrice, setBamkPrice] = useState<number>(initialBamkPrice);

  const handleMyNusdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, '');
    setMyNusd(value === '' ? 0 : Number(value));
  };

  const handlePoolNusdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, '');
    setPoolNusd(value === '' ? 0 : Number(value));
  };

  const handleLPPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/^0+/, '');
    let numericValue = value === '' ? 0 : Number(value);
    if (numericValue > 100) {
        numericValue = 100;
    }
    setLiquidityPoolPercent(numericValue);
  };

  const handleTotalNusdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, '');
    setTotalNusd(value === '' ? 0 : Number(value));
  };

  const handleBamkPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, '');
    setBamkPrice(value === '' ? 0 : Number(value));
  };

  const bamkLiquidityBonus = 5000 * 144;
  const liquidityPoolBonus = (Number(liquidityPoolPercent) / 100) * bamkLiquidityBonus;

  const bamkPerDay = ((Number(walletNusd) + Number(poolNusd) || 0) / Number(totalNusd)) * (31250 * 144) + liquidityPoolBonus;

  if (
    !magicEdenBamkData ||
    !nusdInfoData ||
    !nusdRuneData ||
    !btcPriceData
  ) {
    return (
      <div className="flex justify-center min-h-screen">
        <div className="max-w-screen-xl container flex flex-col gap-8 sm:mt-8 mx-3 md:mx-8">
          <div className="p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">API data missing, check again later..</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="max-w-screen-xl container flex flex-col gap-8 sm:mt-8 mx-3 md:mx-8" style={{ maxWidth: '600px' }}>
        <div className="mt-3 p-4 border border-border/40 rounded-md shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col mt-0">
            <label htmlFor="myNusd" className="block text-sm font-medium text-zinc-50">
              $NUSD in Wallet
              <span className="tooltip">
                <InfoIcon className="info-icon" width={16} height={16} />
                <span className="tooltiptext">Amount freely available to spend/trade, not locked in Liquidity Pool</span>
              </span>
            </label>
            <input
              type="number"
              id="walletNusd"
              value={walletNusd.toString()}
              onChange={handleMyNusdChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md items-center border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="poolNusd" className="block text-sm font-medium text-zinc-50">
              $NUSD in DotSwap LP
              <span className="tooltip">
                <InfoIcon className="info-icon" width={16} height={16} />
                <span className="tooltiptext">Amount committed to DotSwap $NUSD/BTC Liquidity Pool</span>
              </span>
            </label>
            <input
              type="number"
              id="poolNusd"
              value={poolNusd.toString()}
              onChange={handlePoolNusdChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="liquidityPoolPercent" className="block text-sm font-medium text-zinc-50">
              Pool %
              <span className="tooltip">
                  <InfoIcon className="info-icon" width={16} height={16} />
                  <span className="tooltiptext">Your percentage of the pool, number available on DotSwap</span>
              </span>
            </label>
            <input
              type="number"
              id="liquidityPoolPercent"
              value={liquidityPoolPercent.toString()}
              onChange={handleLPPercentChange}
              max="100"
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="totalNusd" className="block text-sm font-medium text-zinc-50">
              $NUSD TVL
              <span className="tooltip">
                  <InfoIcon className="info-icon" width={16} height={16} />
                  <span className="tooltiptext">Total Value Locked in $NUSD protocol.</span>
              </span>
            </label>
            <input
              type="number"
              id="totalNusd"
              value={totalNusd.toString()}
              onChange={handleTotalNusdChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md items-center border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="1"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="bamkPrice" className="block text-sm font-medium text-zinc-50">BAMK Price (sats)</label>
            <input
              type="number"
              id="bamkPrice"
              value={bamkPrice.toString()}
              onChange={handleBamkPriceChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="relative inline-flex items-center w-full px-1 py-1 text-lg font-bold text-primary rounded-xl
          mt-4">
          <p>Daily Reward</p>
          </div>
          <div className="relative inline-flex group mt-1 w-full">
            <div className="absolute transition-all duration-500 opacity-70 -inset-px rounded-xl blur-sm"></div>
            <div className="relative inline-flex items-center w-full px-3 py-4 text-lg font-bold text-primary bg-primary/5 rounded-xl border border-primary">
              <p className="font-bold text-primary">{bamkPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })} BAMK = {((bamkPerDay * Number(bamkPrice))/100000000).toLocaleString(undefined, { maximumFractionDigits: 8 })} BTC = ${(btcPriceData.bitcoin.usd * (Math.floor(bamkPerDay * Number(bamkPrice))) / 100000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="font-bold text-primary"> </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
