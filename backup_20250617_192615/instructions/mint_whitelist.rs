use crate::utils::math::*;
use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn mint_whitelist(
    ctx: Context<MintWhitelistCtx>,
    tier: String,
    _proof: Vec<[u8; 32]>, // Merkle proof for whitelist
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Check if event has capacity
    if event.tickets_sold >= event.total_tickets {
        return Err(TicketError::EventSoldOut.into());
    }
    

    // For now, we'll just check if whitelist is active
    let clock = Clock::get()?;
    if clock.unix_timestamp > event.event_date - 86400 { // 24 hours before event
        return Err(TicketError::WhitelistExpired.into());
    }
    
    // Whitelist gets 20% discount
    let ticket_price = match tier.as_str() {
        "general" => event.general_price * 80 / 100, // 20% off
        "vip" => event.vip_price * 80 / 100,         // 20% off
        _ => return Err(TicketError::InvalidTicketTier.into()),
    };
    
    // Transfer SOL from buyer to event authority
    let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.event_authority.key(),
        ticket_price,
    );
    
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    
    // Increment tickets sold
    event.tickets_sold = safe_add(event.tickets_sold as u64, 1)? as u32;
    
    msg!("Whitelist ticket minted! Event: {}, Tier: {}, Discounted Price: {}", 
        event.name, 
        tier, 
        ticket_price
    );
    
    Ok(())
}

#[derive(Accounts)]
pub struct MintWhitelistCtx<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    /// CHECK: We're just transferring SOL to this account
    #[account(mut)]
    pub event_authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}