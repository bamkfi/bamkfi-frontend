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
  const currentTime = unixTimeInSeconds();
  return unixTime < currentTime;
}

export function unixTimeInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 5)}`;
}
