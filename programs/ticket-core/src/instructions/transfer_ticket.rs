use crate::state::TransferRecord;
use crate::state::TransferType;
use anchor_lang::prelude::*;
use crate::state::{Event, Ticket};
use crate::errors::TicketError;
use crate::utils::math::*;

#[derive(Accounts)]
pub struct TransferTicket<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.owner == from.key() @ TicketError::NotTicketOwner,
        constraint = !ticket.used @ TicketError::TicketAlreadyUsed,
        constraint = !ticket.is_frozen @ TicketError::TicketFrozen
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump,
        constraint = !event.cancelled @ TicketError::EventCancelled,
        constraint = event.transferable @ TicketError::TransfersNotAllowed
    )]
    pub event: Account<'info, Event>,

    /// The current owner transferring the ticket
    #[account(mut)]
    pub from: Signer<'info>,

    /// The new owner receiving the ticket
    /// CHECK: Can be any valid pubkey
    pub to: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn transfer_ticket(
    ctx: Context<TransferTicket>,
    transfer_memo: Option<String>,
) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let event = &ctx.accounts.event;
    let clock = Clock::get()?;

    // Check if transfers are allowed within the time window
    if let Some(transfer_freeze_time) = event.transfer_freeze_time {
        require!(
            clock.unix_timestamp < transfer_freeze_time,
            TicketError::TransferWindowClosed
        );
    }

    // Update ticket ownership
    ticket.owner = ctx.accounts.to.key();
    ticket.transfer_count = safe_add(ticket.transfer_count as u64, 1)? as u32;
    ticket.last_transfer_timestamp = clock.unix_timestamp;
    
    // Store transfer history with proper TransferRecord struct
    ticket.transfer_history.push(TransferRecord {
        from: ctx.accounts.from.key(),
        to: ctx.accounts.to.key(),
        timestamp: clock.unix_timestamp,
        memo: transfer_memo,
        transfer_type: TransferType::Direct,
    });

    msg!("Ticket {} transferred from {} to {}", 
        ticket.ticket_id, 
        ctx.accounts.from.key(), 
        ctx.accounts.to.key()
    );

    Ok(())
}