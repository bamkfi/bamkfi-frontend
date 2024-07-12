import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi, Address, formatUnits } from 'viem';

export function useERC20(params: { contractId: `0x${string}`, tokenDecimals: number}) {
  const account = useAccount();
  const usdeBalanceQueryResult = useReadContract({
    chainId: account.chainId,
    address: params.contractId,
    functionName: 'balanceOf',
    abi: erc20Abi,
    args: [account.address as Address],
  });
  let balance = 0;
  if (usdeBalanceQueryResult.isSuccess) {
    balance = Number(formatUnits(usdeBalanceQueryResult.data, params.tokenDecimals));
  }
  return {
    balance,
  };
}
