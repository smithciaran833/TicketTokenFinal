use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn create_event(
    ctx: Context<CreateEventCtx>,
    name: String,
    venue: String, 
    event_date: i64,
    total_tickets: u32,
    general_price: u64,
    vip_price: u64,
) -> Result<()> {
    msg!("Creating event: {}", name);
    
    // Check the name isn't too long
    if name.len() > 50 {
        return Err(TicketError::EventNameTooLong.into());
    }
    
    // Check venue name isn't too long
    if venue.len() > 50 {
        return Err(TicketError::EventNameTooLong.into());
    }
    
    // Make sure event is in the future
    let clock = Clock::get()?;
    if event_date <= clock.unix_timestamp {
        return Err(TicketError::InvalidEventDate.into());
    }
    
    // Make sure prices make sense (VIP should cost more than GA)
    if vip_price <= general_price {
        return Err(TicketError::InvalidPrice.into());
    }
    
    // Save all the event info
    let event = &mut ctx.accounts.event;
    event.authority = ctx.accounts.authority.key();
    event.name = name;
    event.venue = venue;
    event.event_date = event_date;
    event.total_tickets = total_tickets;
    event.tickets_sold = 0;  // None sold yet
    event.general_price = general_price;
    event.vip_price = vip_price;
    event.bump = ctx.bumps.event;
    
    msg!("Event created successfully!");
    msg!("GA Price: {} lamports", general_price);
    msg!("VIP Price: {} lamports", vip_price);
    msg!("Total Tickets: {}", total_tickets);
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateEventCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 50 + 50 + 8 + 4 + 4 + 8 + 8 + 1,
        seeds = [b"event", name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    
    pub system_program: Program<'info, System>,
}
