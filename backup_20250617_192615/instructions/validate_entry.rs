use crate::utils::math::*;
use anchor_lang::prelude::*;
use crate::state::{Event, Ticket, ValidationRecord, ValidationType};
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct ValidateEntry<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = !ticket.used @ TicketError::TicketAlreadyUsed,
        constraint = !ticket.is_frozen @ TicketError::TicketFrozen
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump,
        constraint = !event.cancelled @ TicketError::EventCancelled
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        payer = validator,
        space = ValidationRecord::LEN,
        seeds = [b"validation", ticket.key().as_ref(), Clock::get()?.unix_timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub validation_record: Account<'info, ValidationRecord>,

    /// The gate staff validating the ticket
    #[account(
        mut,
        constraint = event.gate_staff.contains(&validator.key()) || event.organizer == validator.key() @ TicketError::UnauthorizedValidator
    )]
    pub validator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn validate_entry(
    ctx: Context<ValidateEntry>,
    gate_id: String,
    validation_type: ValidationType,
) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let event = &ctx.accounts.event;
    let validation = &mut ctx.accounts.validation_record;
    let clock = Clock::get()?;

    // Check event timing
    require!(
        clock.unix_timestamp >= event.start_time,
        TicketError::EventNotStarted
    );
    require!(
        clock.unix_timestamp <= event.end_time + 3600, // Allow 1 hour after end
        TicketError::EventEnded
    );

    // Check if ticket has already been validated for entry
    if validation_type == ValidationType::Entry && ticket.entry_validated {
        return Err(TicketError::AlreadyValidatedForEntry.into());
    }

    // Record validation
    validation.ticket = ticket.key();
    validation.validator = ctx.accounts.validator.key();
    validation.timestamp = clock.unix_timestamp;
    validation.gate_id = gate_id.clone();
    validation.validation_type = validation_type.clone();

    // Update ticket based on validation type
    match validation_type {
        ValidationType::Entry => {
            ticket.entry_validated = true;
            ticket.entry_time = Some(clock.unix_timestamp);
            ticket.entry_gate = Some(gate_id);
        },
        ValidationType::Exit => {
            ticket.exit_time = Some(clock.unix_timestamp);
            ticket.exit_gate = Some(gate_id);
        },
        ValidationType::Checkpoint => {
            ticket.checkpoint_scans.push((gate_id, clock.unix_timestamp));
        },
    }

    ticket.validation_count = safe_add(ticket.validation_count as u64, 1)? as u32;
    ticket.last_validated = clock.unix_timestamp;

    msg!("Ticket {} validated at gate {} for {:?}", 
        ticket.ticket_id, 
        validation.gate_id,
        validation_type
    );

    Ok(())
}