export class TicketTier {
  // Core fields (match smart contract)
  name: string;
  price: bigint;
  total_supply: number;
  minted_count: number;
  used_count: number;
  burned_count: number;
  refunded_count: number;
  
  // Dynamic pricing fields
  dynamic_pricing_enabled: boolean;
  min_price?: bigint;
  max_price?: bigint;
  surge_multiplier?: number;
  
  // Additional fields
  description?: string;
  perks?: string[];
  max_per_wallet?: number;
  sale_start_time?: number;
  sale_end_time?: number;
  
  // Computed
  available_count: number;
  sell_through_rate: number;
}
