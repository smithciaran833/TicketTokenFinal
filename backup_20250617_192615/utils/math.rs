//! Safe math operations
use anchor_lang::prelude::*;
use crate::errors::TicketError;

pub fn safe_add(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(TicketError::MathOverflow.into())
}

pub fn safe_sub(a: u64, b: u64) -> Result<u64> {
    a.checked_sub(b).ok_or(TicketError::MathUnderflow.into())
}

pub fn safe_mul(a: u64, b: u64) -> Result<u64> {
    a.checked_mul(b).ok_or(TicketError::MathOverflow.into())
}

pub fn calculate_percentage(amount: u64, basis_points: u16) -> Result<u64> {
    let percentage = safe_mul(amount, basis_points as u64)?;
    percentage.checked_div(10000).ok_or(TicketError::MathOverflow.into())
}

pub fn calculate_surge_multiplier(sold: u32, capacity: u32) -> Result<u16> {
    let utilization = (sold as f64) / (capacity as f64);
    let multiplier = match utilization {
        u if u < 0.5 => 100,   // 1x
        u if u < 0.7 => 110,   // 1.1x
        u if u < 0.8 => 125,   // 1.25x
        u if u < 0.9 => 150,   // 1.5x
        _ => 200,              // 2x
    };
    Ok(multiplier)
}
