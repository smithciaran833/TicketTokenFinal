use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::TicketError;

pub fn emergency_unpause(ctx: Context<EmergencyUnpause>) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    
    program_state.is_paused = false;
    program_state.pause_reason = String::new();
    program_state.paused_at = None;
    
    msg!("Program unpaused by {}", ctx.accounts.authority.key());
    
    Ok(())
}

#[derive(Accounts)]
pub struct EmergencyUnpause<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        constraint = authority.key() == program_state.emergency_authority @ TicketError::Unauthorized
    )]
    pub authority: Signer<'info>,
}
