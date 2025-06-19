//! Input validation utilities
use anchor_lang::prelude::*;
use crate::{constants::*, errors::TicketError};

pub fn validate_event_name(name: &str) -> Result<()> {
    require!(
        name.len() <= MAX_EVENT_NAME_LEN,
        TicketError::EventNameTooLong
    );
    require!(
        !name.is_empty(),
        TicketError::EventNameEmpty
    );
    require!(
        name.chars().all(|c| c.is_alphanumeric() || c.is_whitespace() || "!@#$%^&*()-_=+".contains(c)),
        TicketError::InvalidCharacters
    );
    Ok(())
}

pub fn validate_price_range(price: u64, min: u64, max: u64) -> Result<()> {
    require!(
        price >= min && price <= max,
        TicketError::PriceOutOfRange
    );
    Ok(())
}

pub fn validate_date_range(start: i64, end: i64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(start > now, TicketError::EventInPast);
    require!(end > start, TicketError::InvalidDateRange);
    Ok(())
}
