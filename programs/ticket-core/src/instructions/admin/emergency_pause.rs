use crate::state::program_state::ProgramState;
use anchor_lang::prelude::*;
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        has_one = authority @ TicketError::Unauthorized
    )]
    pub program_state: Account<'info, ProgramState>,
    
    /// CHECK: Authority must sign and match program_state.authority
    pub authority: Signer<'info>,
}

pub fn emergency_pause(ctx: Context<EmergencyPause>) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    
    require!(!program_state.paused, TicketError::AlreadyPaused);
    
    program_state.paused = true;
    program_state.paused_at = Clock::get()?.unix_timestamp;
    
    emit!(EmergencyPauseEvent {
        authority: ctx.accounts.authority.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}

#[event]
pub struct EmergencyPauseEvent {
    pub authority: Pubkey,
    pub timestamp: i64,
}