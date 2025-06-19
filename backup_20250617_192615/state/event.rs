use anchor_lang::prelude::*;
use crate::constants::*;

#[account]
pub struct Event {
    // Version control
    pub version: u8,                        // For future upgrades
    
    // Core fields (existing)
    pub event_id: u64,
    pub organizer: Pubkey,
    pub authority: Pubkey,
    pub name: String,
    pub venue: String,
    pub event_date: i64,                    // Deprecated - use start_time
    pub start_time: i64,
    pub end_time: i64,
    pub total_tickets: u32,
    pub tickets_sold: u32,
    pub tickets_used: u32,
    pub tickets_burned: u32,
    pub general_price: u64,
    pub vip_price: u64,
    pub cancelled: bool,
    pub transferable: bool,
    pub transfer_freeze_time: Option<i64>,
    pub gate_staff: Vec<Pubkey>,
    pub freeze_authorities: Vec<Pubkey>,
    pub burn_authorities: Vec<Pubkey>,
    pub tiers: Vec<TicketTier>,
    pub bump: u8,
    
    // New fields for 10/10
    pub refund_policy: RefundPolicy,        // Refund configuration
    pub compliance_rules: Option<Pubkey>,   // Link to compliance config
    pub is_paused: bool,                    // Circuit breaker
    pub pause_authority: Option<Pubkey>,    // Who can pause
    pub price_multiplier: u16,              // Surge pricing (100 = 1x, 200 = 2x)
    pub last_price_update: i64,             // When price last changed
    pub insurance_pool: Option<Pubkey>,     // Link to insurance
    pub analytics_enabled: bool,            // Track detailed analytics
    pub max_tickets_per_wallet: Option<u16>, // Anti-scalping
    pub created_at: i64,                    // Creation timestamp
    pub updated_at: i64,                    // Last update timestamp
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TicketTier {
    pub name: String,
    pub price: u64,
    pub total_supply: u32,
    pub minted_count: u32,
    pub used_count: u32,
    pub burned_count: u32,
    pub refunded_count: u32,                // NEW
    pub dynamic_pricing_enabled: bool,       // NEW
    pub min_price: Option<u64>,             // NEW
    pub max_price: Option<u64>,             // NEW
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RefundPolicy {
    NoRefunds,
    FullRefund { 
        hours_before_event: u32 
    },
    TieredRefund { 
        tiers: Vec<RefundTier> 
    },
    CustomPolicy {
        handler: Pubkey
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RefundTier {
    pub hours_before: u32,
    pub refund_percentage: u8,  // 0-100
    pub fee_basis_points: u16,  // Platform keeps this fee
}

impl Default for RefundPolicy {
    fn default() -> Self {
        RefundPolicy::TieredRefund {
            tiers: vec![
                RefundTier { hours_before: 168, refund_percentage: 100, fee_basis_points: 0 },    // 7 days: full refund
                RefundTier { hours_before: 72, refund_percentage: 75, fee_basis_points: 250 },   // 3 days: 75% refund
                RefundTier { hours_before: 24, refund_percentage: 50, fee_basis_points: 500 },   // 1 day: 50% refund
            ]
        }
    }
}

impl Event {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        8 + // event_id
        32 + // organizer
        32 + // authority
        100 + // name
        100 + // venue
        8 + // event_date
        8 + // start_time
        8 + // end_time
        4 + // total_tickets
        4 + // tickets_sold
        4 + // tickets_used
        4 + // tickets_burned
        8 + // general_price
        8 + // vip_price
        1 + // cancelled
        1 + // transferable
        9 + // transfer_freeze_time
        (32 * 10) + // gate_staff
        (32 * 10) + // freeze_authorities
        (32 * 10) + // burn_authorities
        (200 * 5) + // tiers
        1 + // bump
        64 + // refund_policy
        33 + // compliance_rules
        1 + // is_paused
        33 + // pause_authority
        2 + // price_multiplier
        8 + // last_price_update
        33 + // insurance_pool
        1 + // analytics_enabled
        3 + // max_tickets_per_wallet
        8 + // created_at
        8 + // updated_at
        256; // padding
}
