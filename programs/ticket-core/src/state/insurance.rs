use anchor_lang::prelude::*;

#[account]
pub struct InsurancePool {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_coverage: u64,
    pub available_funds: u64,
    pub premium_basis_points: u16,          // Fee per ticket
    pub max_claim_per_event: u64,
    pub max_claim_per_ticket: u64,
    pub claims_processed: u32,
    pub claims_paid: u64,
    pub active: bool,
}

#[account]
pub struct InsuranceClaim {
    pub claimant: Pubkey,
    pub ticket: Pubkey,
    pub event: Pubkey,
    pub claim_type: ClaimType,
    pub amount_requested: u64,
    pub amount_approved: Option<u64>,
    pub status: ClaimStatus,
    pub submitted_at: i64,
    pub processed_at: Option<i64>,
    pub evidence: String,
    pub processor: Option<Pubkey>,
    pub rejection_reason: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ClaimType {
    EventCancellation,
    EventPostponement,
    TicketTheft,
    TechnicalIssue,
    FraudulentSale,
    Other(String),
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ClaimStatus {
    Pending,
    UnderReview,
    Approved,
    Rejected,
    Paid,
}
