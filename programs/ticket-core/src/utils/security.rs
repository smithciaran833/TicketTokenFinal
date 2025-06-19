//! Security utilities
use anchor_lang::prelude::*;
use crate::errors::TicketError;

pub struct RateLimiter {
    pub window_start: i64,
    pub counter: u32,
    pub max_per_window: u32,
}

impl RateLimiter {
    pub fn check_and_update(&mut self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        
        // Reset window if expired
        if now - self.window_start > 60 { // 1 minute window
            self.window_start = now;
            self.counter = 0;
        }
        
        require!(
            self.counter < self.max_per_window,
            TicketError::RateLimitExceeded
        );
        
        self.counter += 1;
        Ok(())
    }
}

pub fn verify_multisig(signers: &[Pubkey], required: u8, valid_signers: &[Pubkey]) -> Result<()> {
    let valid_count = signers.iter()
        .filter(|s| valid_signers.contains(s))
        .count();
        
    require!(
        valid_count >= required as usize,
        TicketError::InsufficientSigners
    );
    
    Ok(())
}
