//! Common traits for the ticket system
use anchor_lang::prelude::*;

pub trait Pausable {
    fn pause(&mut self) -> Result<()>;
    fn unpause(&mut self) -> Result<()>;
    fn is_paused(&self) -> bool;
}

pub trait Versioned {
    fn version(&self) -> u32;
    fn migrate(&mut self, from_version: u32) -> Result<()>;
}

pub trait Refundable {
    fn calculate_refund(&self, policy: RefundPolicy) -> Result<u64>;
    fn is_refundable(&self) -> bool;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RefundPolicy {
    Full,
    Percentage(u8),
    Tiered { days_before: Vec<(i64, u8)> },
}
