use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn update_event(
    ctx: Context<UpdateEventCtx>,
    new_venue: Option<String>,
    new_event_date: Option<i64>,
    new_general_price: Option<u64>,
    new_vip_price: Option<u64>,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Only the authority can update
    require!(
        event.authority == ctx.accounts.authority.key(),
        TicketError::Unauthorized
    );
    
    // Update venue if provided
    if let Some(venue) = new_venue {
        if venue.len() > 50 {
            return Err(TicketError::EventNameTooLong.into());
        }
        event.venue = venue;
    }
    
    // Update date if provided
    if let Some(date) = new_event_date {
        let clock = Clock::get()?;
        if date <= clock.unix_timestamp {
            return Err(TicketError::InvalidEventDate.into());
        }
        event.event_date = date;
    }
    
    // Update prices if provided
    if let Some(general) = new_general_price {
        event.general_price = general;
    }
    
    if let Some(vip) = new_vip_price {
        event.vip_price = vip;
    }
    
    // Make sure VIP is still more expensive than GA
    if event.vip_price <= event.general_price {
        return Err(TicketError::InvalidPrice.into());
    }
    
    msg!("Event updated successfully!");
    
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateEventCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, Event>,
}
