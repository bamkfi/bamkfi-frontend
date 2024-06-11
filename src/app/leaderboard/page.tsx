'use client';

import { useState, useEffect } from 'react';
import { Nunito } from 'next/font/google';
import classNames from 'classnames';
import { FaCopy } from 'react-icons/fa';
import styles from './leaderboard.module.css'

const nunito = Nunito({ subsets: ['latin'] });

async function getData() {
  const response = await fetch('/api/getLeaderboard');
  if (!response.ok) {
    return {};
  }
  return response.json();
}

// async function getRewardsByAddress(address: string) {
//   const response = await fetch(`/api/getRewardsByAddress?address=${address}`);
//   if (!response.ok) {
//     return null;
//   }
//   return response.json();
// }

function shortenAddress(address?: string): string {
  if (!address || address.length <= 10) return address || '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function copyToClipboard(text: string) { //handles pc, android but not tested for apple devices
	if (navigator.clipboard && navigator.clipboard.writeText) {
	  navigator.clipboard.writeText(text)
		.catch((err) => alert(`Failed to copy text: ${err}`));
	} else {
	  // Fallback method
	  const textArea = document.createElement("textarea");
	  textArea.value = text;
	  // Position off-screen to avoid scrolling
	  textArea.style.position = 'fixed';
	  textArea.style.top = '-9999px';
	  textArea.style.left = '-9999px';
	  document.body.appendChild(textArea);
	  textArea.select();
	  try {
		document.execCommand('copy');
	  } catch (err) {
		alert(`Failed to copy text: ${err}`);
	  }
	  document.body.removeChild(textArea);
	}
}
  
  

export default function Leaderboard() {
  const [data, setData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const initialData = await getData();
      setData(initialData);
    })();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 953);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(async () => {
        if (searchTerm) {
          const filtered = data.leaderboard_data?.rewards?.filter((address: any) => address.address && address.address.includes(searchTerm));
          if (filtered.length > 0) {
            setFilteredResults(filtered);
          } else {
			setFilteredResults([]);
          }
        } else {
          setFilteredResults(data.leaderboard_data?.rewards || []);
        }
      }, 700)
    );
  }, [searchTerm, data]);

  return (
	<div className="max-w-screen-xl container flex flex-col gap-8 sm:mt-8">
		<div className="flex flex-col gap-4 mx-3 md:mx-8">
		<h1 className={classNames(nunito.className, 'text-3xl mt-2')}>
			Season 1 Airdrop Leaderboard
		</h1>
		<div>
			NUSD Rune and BRC-20 holders accrue pro-rata rewards of 31,250 BAMK per block.
			<br/>
			Rewards will be released 41,982 blocks after the reward is accrued.
		</div>
		</div>
		<div className="max-w-screen-xl mx-3 md:mx-8">
		<input
			type="text"
			placeholder="Search by address"
			className="w-full p-2 border rounded-md mb-2 bg-zinc-700"
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
		/>
		<div className="relative overflow-x-auto shadow-md rounded-lg mt-0.5">
			<table className="w-full text-sm text-left rtl:text-right text-zinc-400">
			<thead className="text-xs uppercase bg-zinc-700 text-zinc-400">
				<tr>
				<th scope="col" className="pl-1 py-4 whitespace-nowrap text-center pr-1" style={{  }}>
					Rank
				</th>
				<th scope="col" className="pl-2 py-4 whitespace-nowrap" style={{  }}>
					Address
				</th>
				<th scope="col" className="px-3 py-3 text-center">
					Amount&nbsp;🏦
				</th>
				<th scope="col" className="px-2 py-3 text-center">
					Value
				</th>
				</tr>
			</thead>
			<tbody>
				{filteredResults.length > 0 ? (
				<>
					{filteredResults.sort((a: any, b: any) => b.amount - a.amount)?.map((address: any, index: number) => (
					<tr key={address.address} className="border-b bg-zinc-800 border-zinc-700 hover:bg-zinc-600 font-mono">
						<td scope="row" className="pl-1 py-4 whitespace-nowrap text-center pr-1">
						{index + 1}
						</td>
						<td scope="row" className="pl-2 py-4 whitespace-nowrap flex items-center">
						{isNarrowScreen ? shortenAddress(address.address) : address.address}
						<FaCopy
							className="ml-0.5 cursor-pointer"
							onClick={() => copyToClipboard(address.address)}
							title="Copy Address"
						/>
						</td>
						<td className="px-1.5 py-4 text-center">
						{address.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
						</td>
						<td className="px-1.5 py-4 text-center">
						{data?.btcPriceData?.bitcoin.usd && address.amount && data.bamkRuneData.curPrice
							? `$${((address.amount * data.bamkRuneData.curPrice) / 100000000 * data?.btcPriceData?.bitcoin.usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
							: '-'}
						</td>
					</tr>
					))}
				</>
				) : (
				<tr className="bg-zinc-800 hover:bg-zinc-600">
					<td scope="row" className="px-6 py-4 text-white">
					Fetching leaderboard..
					</td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				)}
			</tbody>
			</table>
		</div>
		</div>
		{data.leaderboard_data?.block && (
		<div className="ml-auto mr-auto text-zinc-400">
			Leaderboard synced to block {data.leaderboard_data.block}
		</div>
		)}
	</div>
  );  
}