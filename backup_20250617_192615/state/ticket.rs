use anchor_lang::prelude::*;

#[account]
pub struct Ticket {
    // Version control
    pub version: u8,                        // For future upgrades
    
    // Core fields (existing)
    pub ticket_id: u64,
    pub event: Pubkey,
    pub owner: Pubkey,
    pub original_owner: Pubkey,
    pub tier_index: usize,
    pub purchase_price: u64,
    pub purchased_at: i64,
    pub used: bool,
    pub used_at: Option<i64>,
    pub is_frozen: bool,
    pub freeze_timestamp: Option<i64>,
    pub unfreeze_timestamp: Option<i64>,
    pub entry_validated: bool,
    pub entry_time: Option<i64>,
    pub entry_gate: Option<String>,
    pub exit_time: Option<i64>,
    pub exit_gate: Option<String>,
    pub transfer_count: u32,
    pub last_transfer_timestamp: i64,
    pub pending_transfer: bool,
    pub validation_count: u32,
    pub last_validated: i64,
    pub checkpoint_scans: Vec<(String, i64)>,
    pub transfer_history: Vec<TransferRecord>,
    pub delegate_transfer_history: Vec<DelegateTransferRecord>,
    pub metadata_uri: String,
    pub bump: u8,
    
    // New fields for 10/10
    pub status: TicketStatus,               // Current status
    pub refund_eligible: bool,              // Can be refunded
    pub refund_deadline: Option<i64>,       // When refund expires
    pub refunded_at: Option<i64>,           // When refunded
    pub refund_amount: Option<u64>,         // Amount refunded
    pub refund_reason: Option<String>,      // Why refunded
    pub compliance_verified: bool,          // KYC/AML passed
    pub compliance_data: Option<Pubkey>,    // Link to compliance record
    pub insurance_coverage: Option<u64>,    // Insurance amount
    pub special_benefits: Vec<String>,      // VIP perks, etc
    pub qr_code_hash: Option<[u8; 32]>,    // For offline validation
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransferRecord {
    pub from: Pubkey,
    pub to: Pubkey,
    pub timestamp: i64,
    pub memo: Option<String>,
    pub transfer_type: TransferType,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DelegateTransferRecord {
    pub from: Pubkey,
    pub to: Pubkey,
    pub timestamp: i64,
    pub email_hash: [u8; 32],
    pub claimed_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TicketStatus {
    Valid,
    Used,
    Refunded,
    Expired,
    Frozen,
    Burned,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TransferType {
    Direct,
    Delegated,
    Gift,
    Marketplace,
    Admin,
}

impl Ticket {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        8 + // ticket_id
        32 + // event
        32 + // owner
        32 + // original_owner
        8 + // tier_index
        8 + // purchase_price
        8 + // purchased_at
        1 + // used
        9 + // used_at
        1 + // is_frozen
        9 + // freeze_timestamp
        9 + // unfreeze_timestamp
        1 + // entry_validated
        9 + // entry_time
        50 + // entry_gate
        9 + // exit_time
        50 + // exit_gate
        4 + // transfer_count
        8 + // last_transfer_timestamp
        1 + // pending_transfer
        4 + // validation_count
        8 + // last_validated
        (100 * 10) + // checkpoint_scans
        (200 * 10) + // transfer_history
        (150 * 10) + // delegate_transfer_history
        200 + // metadata_uri
        1 + // bump
        1 + // status
        1 + // refund_eligible
        9 + // refund_deadline
        9 + // refunded_at
        9 + // refund_amount
        200 + // refund_reason
        1 + // compliance_verified
        33 + // compliance_data
        9 + // insurance_coverage
        (50 * 10) + // special_benefits
        33 + // qr_code_hash
        512; // padding
}
