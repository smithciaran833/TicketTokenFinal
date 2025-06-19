use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump,
        constraint = !program_state.is_paused @ TicketError::ProgramPaused
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        constraint = authority.key() == program_state.emergency_authority @ TicketError::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[account]
pub struct ProgramState {
    pub version: u8,
    pub authority: Pubkey,
    pub emergency_authority: Pubkey,
    pub is_paused: bool,
    pub pause_reason: String,
    pub paused_at: Option<i64>,
    pub paused_by: Option<Pubkey>,
    pub total_events: u64,
    pub total_tickets: u64,
    pub total_revenue: u64,
    pub feature_flags: u64,
}

impl ProgramState {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 1 + 200 + 9 + 33 + 8 + 8 + 8 + 8 + 64;
}

pub fn emergency_pause(
    ctx: Context<EmergencyPause>,
    reason: String,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let clock = Clock::get()?;

    program_state.is_paused = true;
    program_state.pause_reason = reason.clone();
    program_state.paused_at = Some(clock.unix_timestamp);
    program_state.paused_by = Some(ctx.accounts.authority.key());

    msg!("EMERGENCY: Program paused by {} at {} - Reason: {}", 
        ctx.accounts.authority.key(),
        clock.unix_timestamp,
        reason
    );

    // Emit event for monitoring
    emit!(EmergencyPauseEvent {
        authority: ctx.accounts.authority.key(),
        timestamp: clock.unix_timestamp,
        reason,
    });

    Ok(())
}

#[event]
pub struct EmergencyPauseEvent {
    pub authority: Pubkey,
    pub timestamp: i64,
    pub reason: String,
}
