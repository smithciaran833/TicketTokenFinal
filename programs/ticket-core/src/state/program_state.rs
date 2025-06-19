use anchor_lang::prelude::*;

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub paused: bool,
    pub paused_at: i64,
    pub fee_recipient: Pubkey,
    pub platform_fee_basis_points: u16, // 100 = 1%
    pub total_events: u64,
    pub total_tickets_sold: u64,
    pub total_fees_collected: u64,
}

impl ProgramState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        1 + // paused
        8 + // paused_at
        32 + // fee_recipient
        2 + // platform_fee_basis_points
        8 + // total_events
        8 + // total_tickets_sold
        8; // total_fees_collected
}
