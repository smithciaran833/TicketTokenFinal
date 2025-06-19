use crate::state::program_state::ProgramState;
use anchor_lang::prelude::*;
use crate::errors::TicketError;

pub fn emergency_unpause(ctx: Context<EmergencyUnpause>) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    
    require!(program_state.paused, TicketError::NotPaused);
    
    program_state.paused = false;
    program_state.paused_at = 0;
    
    emit!(EmergencyUnpauseEvent {
        authority: ctx.accounts.authority.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct EmergencyUnpause<'info> {
    #[account(
        mut,
        has_one = authority @ TicketError::Unauthorized
    )]
    pub program_state: Account<'info, ProgramState>,
    
    /// CHECK: Authority must sign and match program_state.authority
    pub authority: Signer<'info>,
}

#[event]
pub struct EmergencyUnpauseEvent {
    pub authority: Pubkey,
    pub timestamp: i64,
}