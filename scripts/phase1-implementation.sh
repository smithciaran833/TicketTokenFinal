#!/bin/bash

echo "🔧 PHASE 1: Core Improvements"
echo "============================"
echo ""

# Step 1: Show how to split state.rs
echo "📁 Step 1: Split state.rs into modules"
echo "-------------------------------------"
echo "1. Create state/event.rs:"
cat << 'CODE'
// Move this from state.rs to state/event.rs
use anchor_lang::prelude::*;
use crate::constants::*;

#[account]
pub struct Event {
    // Add version field
    pub version: u8,                // NEW: For upgrades
    
    // Existing fields with better documentation
    pub event_id: u64,              
    pub organizer: Pubkey,          
    pub authority: Pubkey,          
    pub name: String,               
    pub venue: String,              
    
    // ... rest of existing Event fields ...
    
    // New fields for 10/10
    pub refund_policy: RefundPolicy,     // NEW
    pub compliance_config: Pubkey,       // NEW: Links to compliance
    pub is_paused: bool,                 // NEW: Circuit breaker
    pub price_multiplier: u16,           // NEW: Surge pricing (100 = 1x)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RefundPolicy {
    NoRefunds,
    FullRefund { hours_before: u32 },
    TieredRefund { tiers: Vec<(u32, u8)> }, // (hours_before, percentage)
}
CODE

echo ""
echo "2. Create state/mod.rs:"
cat << 'CODE'
pub mod event;
pub mod ticket;
pub mod compliance;
pub mod analytics;

pub use event::*;
pub use ticket::*;
pub use compliance::*;
pub use analytics::*;

// Re-export existing types
pub use crate::state::{
    DelegateAuthority,
    ValidationRecord,
    ValidationType,
    FreezeRecord,
    FreezeReason,
    Whitelist,
};
CODE

echo ""
echo "📝 Step 2: Update arithmetic operations"
echo "--------------------------------------"
echo "In each instruction file, replace:"
echo "  event.tickets_sold += 1;"
echo "With:"
echo "  event.tickets_sold = safe_add(event.tickets_sold as u64, 1)? as u32;"
echo ""
echo "Example for mint_ticket.rs:"
cat << 'CODE'
use crate::utils::math::*;  // Add this import

// In the instruction:
event.tickets_sold = safe_add(event.tickets_sold as u64, 1)? as u32;

// For tier updates:
if tier_index < event.tiers.len() {
    let tier = &mut event.tiers[tier_index];
    tier.minted_count = safe_add(tier.minted_count as u64, 1)? as u32;
}
CODE

echo ""
echo "📝 Step 3: Update errors.rs with codes"
echo "-------------------------------------"
cat << 'CODE'
#[error_code]
pub enum TicketError {
    #[msg("E1001: Event name too long (max 50 characters)")]
    EventNameTooLong = 1001,
    
    #[msg("E1002: Event is sold out")]
    EventSoldOut = 1002,
    
    // ... update all existing errors with codes ...
    
    // New errors for 10/10 features
    #[msg("E2001: Refund window has closed")]
    RefundWindowClosed = 2001,
    
    #[msg("E2002: Refund amount exceeds purchase price")]
    RefundAmountInvalid = 2002,
    
    #[msg("E3001: Program is paused for emergency")]
    ProgramPaused = 3001,
    
    #[msg("E3002: Rate limit exceeded")]
    RateLimitExceeded = 3002,
    
    #[msg("E4001: KYC verification required")]
    KycRequired = 4001,
    
    #[msg("E4002: Geographic region blocked")]
    RegionBlocked = 4002,
}
CODE

echo ""
echo "✅ Ready to implement!"
echo "Start by updating state.rs, then errors.rs, then fix arithmetic."
echo "Run: ./scripts/phase2-features.sh when Phase 1 is complete"
