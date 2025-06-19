use anchor_lang::prelude::*;
use crate::state::{Event, EventUpdatedEvent};
use crate::errors::TicketError;
use crate::utils::validation::*;

pub fn update_event(
    ctx: Context<UpdateEvent>,
    name: Option<String>,
    description: Option<String>,
    venue: Option<String>,
    event_date: Option<i64>,
    ticket_price: Option<u64>,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;
    
    // Check event hasn't started
    require!(
        clock.unix_timestamp < event.start_time,
        TicketError::EventAlreadyStarted
    );
    
    // Update fields if provided
    if let Some(new_name) = name {
        validate_event_name(&new_name)?;
        event.name = new_name;
    }
    
    if let Some(new_description) = description {
        validate_description(&new_description)?;
        event.description = new_description;
    }
    
    if let Some(new_venue) = venue {
        validate_venue(&new_venue)?;
        event.venue = new_venue;
    }
    
    if let Some(new_date) = event_date {
        if event.end_time != 0 {
            validate_event_times(new_date, event.end_time)?;
        } else {
            validate_event_times(new_date, new_date + 86400)?; // Default 24 hour event
        }
        event.start_time = new_date;
    }
    
    if let Some(new_price) = ticket_price {
        validate_ticket_price(new_price)?;
        event.base_price = new_price;
    }
    
    event.updated_at = clock.unix_timestamp;
    
    emit!(EventUpdatedEvent {
        event_id: event.key(),
        updated_at: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateEvent<'info> {
    #[account(
        mut,
        has_one = authority @ TicketError::Unauthorized
    )]
    pub event: Account<'info, Event>,
    
    pub authority: Signer<'info>,
}