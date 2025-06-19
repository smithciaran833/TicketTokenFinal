use crate::state::{Event, Ticket, RefundRequest};
use crate::errors::TicketError;
use anchor_lang::prelude::*;

pub fn process_refund(_ctx: Context<ProcessRefund>) -> Result<()> {
    // TODO: Implement refund processing logic
    Ok(())
}

#[derive(Accounts)]
pub struct ProcessRefund<'info> {
    #[account(
        has_one = authority @ TicketError::Unauthorized
    )]
    pub event: Account<'info, Event>,
    
    /// CHECK: Event authority must sign to process refunds
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub refund_request: Account<'info, RefundRequest>,
    
    #[account(mut)]
    pub ticket: Account<'info, Ticket>,
    
    /// CHECK: User receiving the refund
    #[account(mut)]
    pub user: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}