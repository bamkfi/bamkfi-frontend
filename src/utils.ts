export const explorerLink = (
  network: string,
  value: string,
  type = 'tx'
): string => {
  return network === 'btc'
    ? `https://mempool.space/${type}/${value}`
    : `https://${
        network === 'sepolia' ? 'sepolia.' : ''
      }etherscan.io/${type}}/${value}`;
};
export function isExpired(unixTime: number): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return unixTime < currentTime;
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 5)}`;
}
