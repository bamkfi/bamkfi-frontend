'use client';

import { useData } from '@/app/context/datacontext';
import { useState } from 'react';

export default function Calculator() {
  const {
	bamkRune2Data,
    nusdInfoData,
    nusdRuneData,
    btcPriceData,
    bestHeightData,
  } = useData();

  let initialTotalNusd = 2000000; // Default value if totalNusd is not available
  let initialBamkPrice = 0;

  if (nusdRuneData && nusdInfoData) {
    initialTotalNusd = (2100000000000000 - Number(nusdRuneData.amount)) + Number(nusdInfoData.minted);
  }

  if (bamkRune2Data) {
    initialBamkPrice = Number(bamkRune2Data.floorUnitPrice.formatted);
  }

  const [myNusd, setMyNusd] = useState('2000');
  const [totalNusd, setTotalNusd] = useState(initialTotalNusd);
  const [bamkPrice, setBamkPrice] = useState(initialBamkPrice);

  const handleMyNusdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize leading zeros
    const sanitizedValue = value.replace(/^0+(?=\d)/, '');
    setMyNusd(sanitizedValue);
  };

  const handleTotalNusdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize leading zeros
    const sanitizedValue = value.replace(/^0+(?=\d)/, '');
    setTotalNusd(Number(sanitizedValue));
  };

  const handleBamkPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize leading zeros
    const sanitizedValue = value.replace(/^0+(?=\d)/, '');
    setBamkPrice(Number(sanitizedValue));
  };

  const bamkPerDay = ((Number(myNusd) || 0) / totalNusd) * (31250 * 144);

  if (
    !bamkRune2Data ||
    !nusdInfoData ||
    !nusdRuneData ||
    !btcPriceData ||
    !bestHeightData
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
            <label htmlFor="myNusd" className="block text-sm font-medium text-zinc-50">My $NUSD</label>
            <input
              type="text"
              id="myNusd"
              value={myNusd}
              onChange={handleMyNusdChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md items-center border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="totalNusd" className="block text-sm font-medium text-zinc-50">$NUSD TVL</label>
            <input
              type="text"
              id="totalNusd"
              value={totalNusd}
              onChange={handleTotalNusdChange}
              className="mt-4 bg-accent flex text-sm gap-2 px-4 py-3 rounded-md items-center border border-black-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-white placeholder-zinc-400 appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label htmlFor="bamkPrice" className="block text-sm font-medium text-zinc-50">BAMK Price (sats)</label>
            <input
              type="text"
              id="bamkPrice"
              value={bamkPrice}
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
              <p className="font-bold text-primary">{bamkPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })} BAMK = {((bamkPerDay * bamkPrice)/100000000).toLocaleString(undefined, { maximumFractionDigits: 8 })} BTC = ${(btcPriceData.bitcoin.usd * (Math.floor(bamkPerDay * bamkPrice)) / 100000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="font-bold text-primary"> </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
