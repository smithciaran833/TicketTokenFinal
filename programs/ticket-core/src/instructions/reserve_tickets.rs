use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn reserve_tickets(
    ctx: Context<ReserveTicketsCtx>,
    quantity: u32,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Only event authority can reserve tickets
    require!(
        event.authority == ctx.accounts.authority.key(),
        TicketError::Unauthorized
    );
    
    // Check if we have enough capacity
    if event.tickets_sold + quantity > event.total_tickets {
        return Err(TicketError::InsufficientCapacity.into());
    }
    
    // Reserve tickets (no payment needed - these are for artist/venue)
    event.tickets_sold += quantity;
    
    msg!("Reserved {} tickets for event {}", quantity, event.name);
    
    Ok(())
}

#[derive(Accounts)]
pub struct ReserveTicketsCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, Event>,
}