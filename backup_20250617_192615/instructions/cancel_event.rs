use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn cancel_event(
    ctx: Context<CancelEventCtx>,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Only the authority can cancel
    require!(
        event.authority == ctx.accounts.authority.key(),
        TicketError::Unauthorized
    );
    
    // Can't cancel if tickets have been sold
    if event.tickets_sold > 0 {
        return Err(TicketError::EventHasTicketsSold.into());
    }
    
    msg!("Event cancelled: {}", event.name);
    
    // Close the account and return rent to authority
    // This is handled by the close constraint
    
    Ok(())
}

#[derive(Accounts)]
pub struct CancelEventCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        close = authority
    )]
    pub event: Account<'info, Event>,
}
