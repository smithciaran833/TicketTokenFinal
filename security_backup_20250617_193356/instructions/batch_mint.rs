use anchor_lang::prelude::*;
use crate::{state::*, errors::TicketError};

pub fn batch_mint(
    ctx: Context<BatchMintCtx>,
    tier: String,
    quantity: u32,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    
    // Check if we have enough capacity
    if event.tickets_sold + quantity > event.total_tickets {
        return Err(TicketError::InsufficientCapacity.into());
    }
    
    // Max 100 tickets per batch to avoid transaction size limits
    if quantity > 100 {
        return Err(TicketError::BatchSizeTooLarge.into());
    }
    
    // Calculate total price
    let ticket_price = match tier.as_str() {
        "general" => event.general_price,
        "vip" => event.vip_price,
        _ => return Err(TicketError::InvalidTicketTier.into()),
    };
    
    let total_price = ticket_price
        .checked_mul(quantity as u64)
        .ok_or(TicketError::MathOverflow)?;
    
    // Transfer SOL for all tickets
    let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.event_authority.key(),
        total_price,
    );
    
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    
    // Update tickets sold
    event.tickets_sold += quantity;
    
    msg!("Batch minted {} {} tickets for event {}", 
        quantity, 
        tier, 
        event.name
    );
    
    Ok(())
}

#[derive(Accounts)]
pub struct BatchMintCtx<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub event: Account<'info, Event>,
    
    /// CHECK: We're just transferring SOL to this account
    #[account(mut)]
    pub event_authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
