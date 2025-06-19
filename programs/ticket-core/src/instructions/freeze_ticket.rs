use anchor_lang::prelude::*;
use crate::state::{Event, Ticket, FreezeRecord, FreezeReason};
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct FreezeTicket<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = !ticket.is_frozen @ TicketError::TicketAlreadyFrozen
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        payer = authority,
        space = FreezeRecord::LEN,
        seeds = [b"freeze", ticket.key().as_ref()],
        bump
    )]
    pub freeze_record: Account<'info, FreezeRecord>,

    /// Event organizer or fraud prevention authority
    #[account(
        mut,
        constraint = event.organizer == authority.key() || event.freeze_authorities.contains(&authority.key()) @ TicketError::UnauthorizedFreezer
    )]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnfreezeTicket<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.is_frozen @ TicketError::TicketNotFrozen
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(
        mut,
        seeds = [b"freeze", ticket.key().as_ref()],
        bump,
        close = authority
    )]
    pub freeze_record: Account<'info, FreezeRecord>,

    /// Event organizer only (higher authority needed to unfreeze)
    #[account(
        mut,
        constraint = event.organizer == authority.key() @ TicketError::UnauthorizedUnfreezer
    )]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn freeze_ticket(
    ctx: Context<FreezeTicket>,
    reason: FreezeReason,
    evidence: String,
) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let freeze_record = &mut ctx.accounts.freeze_record;
    let clock = Clock::get()?;

    // Freeze the ticket
    ticket.is_frozen = true;
    ticket.freeze_timestamp = Some(clock.unix_timestamp);

    // Create freeze record
    freeze_record.ticket = ticket.key();
    freeze_record.frozen_by = ctx.accounts.authority.key();
    freeze_record.freeze_timestamp = clock.unix_timestamp;
    freeze_record.reason = reason.clone();
    freeze_record.evidence = evidence;
    freeze_record.unfrozen = false;

    msg!("Ticket {} frozen for reason: {:?}", ticket.ticket_id, reason);

    Ok(())
}

pub fn unfreeze_ticket(ctx: Context<UnfreezeTicket>, unfreeze_note: String) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let freeze_record = &mut ctx.accounts.freeze_record;
    let clock = Clock::get()?;

    // Unfreeze the ticket
    ticket.is_frozen = false;
    ticket.unfreeze_timestamp = Some(clock.unix_timestamp);

    // Update freeze record before closing
    freeze_record.unfrozen = true;
    freeze_record.unfrozen_by = Some(ctx.accounts.authority.key());
    freeze_record.unfreeze_timestamp = Some(clock.unix_timestamp);
    freeze_record.unfreeze_note = Some(unfreeze_note);

    msg!("Ticket {} unfrozen", ticket.ticket_id);

    // Account is closed automatically due to close = authority constraint
    Ok(())
}