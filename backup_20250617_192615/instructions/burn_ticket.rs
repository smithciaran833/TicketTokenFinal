use crate::utils::math::*;
use anchor_lang::prelude::*;
use crate::state::{Event, Ticket};
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct BurnTicket<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.entry_validated @ TicketError::TicketNotValidated,
        constraint = !ticket.used @ TicketError::TicketAlreadyUsed,
        close = ticket_owner
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        mut,
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,

    /// The ticket owner (receives rent back)
    /// CHECK: Verified through ticket.owner constraint
    #[account(
        mut,
        constraint = ticket.owner == ticket_owner.key() @ TicketError::NotTicketOwner
    )]
    pub ticket_owner: AccountInfo<'info>,

    /// Event organizer or authorized burner
    #[account(
        constraint = event.organizer == authority.key() || event.burn_authorities.contains(&authority.key()) @ TicketError::UnauthorizedBurner
    )]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkTicketUsed<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.entry_validated @ TicketError::TicketNotValidated,
        constraint = !ticket.used @ TicketError::TicketAlreadyUsed
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,

    /// Event organizer or gate staff
    #[account(
        constraint = event.organizer == authority.key() || event.gate_staff.contains(&authority.key()) @ TicketError::UnauthorizedValidator
    )]
    pub authority: Signer<'info>,
}

pub fn burn_ticket(ctx: Context<BurnTicket>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let ticket_id = ctx.accounts.ticket.ticket_id;
    let tier_index = ctx.accounts.ticket.tier_index;

    // Update event stats before closing account
    event.tickets_used = safe_add(event.tickets_used as u64, 1)? as u32;
    event.tickets_burned = safe_add(event.tickets_burned as u64, 1)? as u32;
    
    // Update tier-specific counts
    if tier_index < event.tiers.len() {
        event.tiers[tier_index].used_count = safe_add(event.tiers[tier_index].used_count as u64, 1)? as u32;
        event.tiers[tier_index].burned_count = safe_add(event.tiers[tier_index].burned_count as u64, 1)? as u32;
    }

    msg!("Ticket {} burned permanently", ticket_id);

    // Account is closed automatically due to close = ticket_owner constraint
    Ok(())
}

pub fn mark_ticket_used(ctx: Context<MarkTicketUsed>) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let event = &mut ctx.accounts.event;
    let clock = Clock::get()?;

    // Mark ticket as used but keep it in system
    ticket.used = true;
    ticket.used_at = Some(clock.unix_timestamp);

    // Update event stats
    event.tickets_used = safe_add(event.tickets_used as u64, 1)? as u32;
    
    // Update tier-specific count
    if ticket.tier_index < event.tiers.len() {
        event.tiers[ticket.tier_index].used_count = safe_add(event.tiers[ticket.tier_index].used_count as u64, 1)? as u32;
    }

    msg!("Ticket {} marked as used at {}", ticket.ticket_id, clock.unix_timestamp);

    Ok(())
}