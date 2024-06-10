import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi, Address, formatUnits } from 'viem';
import { USDE_CONTRACT_ADDRESS_MAINNET, USDF_CONTRACT_ADDRESS_SEPOLIA } from '@/lib/constants';

export function useERC20() {
  const account = useAccount();
  const usdeBalanceQueryResult = useReadContract({
    chainId: account.chainId,
    address:
      account.chainId === 1
        ? USDE_CONTRACT_ADDRESS_MAINNET
        : USDF_CONTRACT_ADDRESS_SEPOLIA,
    functionName: 'balanceOf',
    abi: erc20Abi,
    args: [account.address as Address],
  });
  let balanceUSDE = 0;
  if (usdeBalanceQueryResult.isSuccess) {
    balanceUSDE = Number(formatUnits(usdeBalanceQueryResult.data, 18));
  }
  return {
    balanceUSDE,
  };
}
