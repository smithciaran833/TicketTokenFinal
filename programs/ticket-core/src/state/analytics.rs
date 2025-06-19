use anchor_lang::prelude::*;

#[account]
pub struct EventAnalytics {
    pub event: Pubkey,
    pub total_revenue: u64,
    pub total_refunds: u64,
    pub unique_buyers: u32,
    pub repeat_buyers: u32,
    pub average_price: u64,
    pub peak_sales_timestamp: i64,
    pub peak_sales_count: u32,
    pub sales_by_tier: Vec<TierAnalytics>,
    pub sales_by_hour: [u32; 24],           // Sales per hour of day
    pub geographic_distribution: Vec<GeoData>,
    pub referral_sources: Vec<ReferralData>,
    pub conversion_rate: f32,               // Views to purchases
    pub abandonment_rate: f32,              // Started but didn't complete
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TierAnalytics {
    pub tier_name: String,
    pub sold_count: u32,
    pub revenue: u64,
    pub avg_price: u64,
    pub sell_through_rate: f32,            // Sold / Available
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GeoData {
    pub region: [u8; 2],                    // ISO code
    pub ticket_count: u32,
    pub revenue: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ReferralData {
    pub source: String,
    pub count: u32,
    pub conversion_rate: f32,
}
