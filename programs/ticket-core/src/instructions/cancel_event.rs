use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::TicketError;

pub fn cancel_event(ctx: Context<CancelEvent>, reason: String) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;
    
    // Validate event can be cancelled
    require!(!event.cancelled, TicketError::EventAlreadyCancelled);
    require!(event.start_time > clock.unix_timestamp, TicketError::EventAlreadyStarted);
    
    // Mark as cancelled
    event.cancelled = true;
    event.cancelled_at = clock.unix_timestamp;
    event.cancellation_reason = reason.clone();
    
    emit!(EventCancelledEvent {
        event_id: event.event_id,
        authority: ctx.accounts.authority.key(),
        reason,
        timestamp: clock.unix_timestamp,
        refund_enabled: event.refund_enabled,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct CancelEvent<'info> {
    #[account(
        mut,
        has_one = authority @ TicketError::Unauthorized
    )]
    pub event: Account<'info, Event>,
    
    /// CHECK: Event authority must sign
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}