use crate::state::program_state::ProgramState;
use crate::errors::TicketError;
use anchor_lang::prelude::*;

pub fn update_authorities(_ctx: Context<UpdateAuthorities>) -> Result<()> {
    // TODO: Implement authority update logic
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateAuthorities<'info> {
    #[account(
        mut,
        has_one = authority @ TicketError::Unauthorized,
        constraint = authority.key() == program_state.authority @ TicketError::Unauthorized
    )]
    pub program_state: Account<'info, ProgramState>,
    
    /// CHECK: Current authority must sign - this is a critical operation
    pub authority: Signer<'info>,
    
    /// CHECK: New authority to set (validated in instruction)
    pub new_authority: UncheckedAccount<'info>,
}