import USDTIcon from "@/icons/USDT";
import UsdeIcon from "@/icons/USDe";
import { USDE_CONTRACT_ADDRESS_MAINNET, USDF_CONTRACT_ADDRESS_SEPOLIA, USDT_CONTRACT_ADDRESS_MAINNET } from "@/lib/constants";
import { useSearchParams } from "next/navigation";

export function useFromTokenInfo() {

  const search = useSearchParams()
  let tokenDecimals: number;
  let contractId: `0x${string}`;
  let icon: React.ReactNode;
  let ticker = ""
  if (process.env.NEXT_PUBLIC_ETH_NETWORK === 'sepolia') {
    contractId = USDF_CONTRACT_ADDRESS_SEPOLIA
    tokenDecimals = 18;
    icon = <UsdeIcon height={24} width={24} />
    ticker = "USDF"
  } else if (search?.get('from') === 'usde') {
    contractId = USDE_CONTRACT_ADDRESS_MAINNET
    tokenDecimals = 18;
    icon = <UsdeIcon height={24} width={24} />
    ticker = "USDe"
  } else {
    contractId = USDT_CONTRACT_ADDRESS_MAINNET
    tokenDecimals = 6;
    icon= <USDTIcon height={24} width={24} />
    ticker = "USDT"
  }

  return {
    tokenDecimals,
    contractId,
    icon,
    ticker
  };
}