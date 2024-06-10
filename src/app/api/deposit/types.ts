export interface GetDepositsQueryParams {
    eth_account?: `0x${string}` | undefined;
    eth_txid?: string;
    pending_only?: boolean;
    limit?: number;
    offset?: number;
  }
  
  export type GetDepositResponse = {
    deposits: {
      from_eth_account: `0x${string}` | undefined;
      from_usde_amount: string;
      to_btc_address: string;
      btc_fee_per_vb: number;
      deposit_usde_account: string;
      deposit_usde_total_amount: string;
      expires: number;
      eth_txid: string | null;
      btc_inscribe_txid: string | null;
      btc_reveal_txid: string | null;
    }[],
    total: number;
  };
  
  export interface PostDepositRequest {
      timestamp: number,
      from_eth_account: `0x${string}` | undefined,
      from_usde_amount: string,
      to_btc_address: string,
  }
  
  interface PostDepositFeeResponse {
    btc_price_usd: number,
    btc_fees_required: number,
    usde_added_fees: string,
  }
  
  
  export interface PostDepositResponse {
      deposit_usde_account: `0x${string}` | undefined,
      deposit_usde_total_amount: string,
      expires: number,
      request: PostDepositRequest,
      fees: PostDepositFeeResponse,
  }
  
  export interface GetHoldersResponse {
    data: { overall_balance: string, wallet: string }[]
    block_height: number
  }