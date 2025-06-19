pub mod event;
pub mod ticket;
pub mod compliance;
pub mod analytics;
pub mod insurance;

pub use event::*;
pub use ticket::*;
pub use compliance::*;
pub use analytics::*;
pub use insurance::*;

// Legacy types - these were in the original state.rs
use anchor_lang::prelude::*;

#[account]
pub struct DelegateAuthority {
    pub ticket: Pubkey,
    pub original_owner: Pubkey,
    pub email_hash: [u8; 32],
    pub claim_code: [u8; 16],
    pub created_at: i64,
    pub expires_at: i64,
    pub claimed: bool,
}

impl DelegateAuthority {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 16 + 8 + 8 + 1 + 64;
}

#[account]
pub struct ValidationRecord {
    pub ticket: Pubkey,
    pub validator: Pubkey,
    pub timestamp: i64,
    pub gate_id: String,
    pub validation_type: ValidationType,
}

impl ValidationRecord {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 50 + 1 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum ValidationType {
    Entry,
    Exit,
    Checkpoint,
}

#[account]
pub struct FreezeRecord {
    pub ticket: Pubkey,
    pub frozen_by: Pubkey,
    pub freeze_timestamp: i64,
    pub reason: FreezeReason,
    pub evidence: String,
    pub unfrozen: bool,
    pub unfrozen_by: Option<Pubkey>,
    pub unfreeze_timestamp: Option<i64>,
    pub unfreeze_note: Option<String>,
}

impl FreezeRecord {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 200 + 1 + 33 + 9 + 200 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum FreezeReason {
    SuspectedFraud,
    DuplicateDetected,
    PaymentIssue,
    SecurityConcern,
    LegalHold,
    Other,
}

#[account]
pub struct Whitelist {
    pub event: Pubkey,
    pub merkle_root: [u8; 32],
    pub max_per_wallet: u8,
    pub active: bool,
}

impl Whitelist {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 64;
}

// Re-export from admin module
pub use crate::instructions::admin::ProgramState;
pub use crate::{RefundRequest, RefundStatus};