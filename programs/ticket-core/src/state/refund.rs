use anchor_lang::prelude::*;

#[account]
pub struct RefundRequest {
    pub ticket_mint: Pubkey,
    pub requester: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
    pub status: RefundStatus,
    pub requested_at: i64,
    pub processed_at: Option<i64>,
    pub reason: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RefundStatus {
    Pending,
    Approved,
    Rejected,
    Processed,
    Cancelled,
}
