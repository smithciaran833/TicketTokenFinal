use crate::utils::math::*;
use anchor_lang::prelude::*;
use crate::state::{Event, Ticket, DelegateAuthority};
use crate::errors::TicketError;

#[derive(Accounts)]
pub struct InitializeDelegateTransfer<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.owner == owner.key() @ TicketError::NotTicketOwner,
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

    #[account(
        init,
        payer = owner,
        space = DelegateAuthority::LEN,
        seeds = [b"delegate", ticket.key().as_ref()],
        bump
    )]
    pub delegate_authority: Account<'info, DelegateAuthority>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteDelegateTransfer<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(
        mut,
        seeds = [b"delegate", ticket.key().as_ref()],
        bump,
        constraint = delegate_authority.ticket == ticket.key() @ TicketError::InvalidDelegateAuthority,
        constraint = !delegate_authority.claimed @ TicketError::DelegateAlreadyClaimed,
        constraint = delegate_authority.expires_at > Clock::get()?.unix_timestamp @ TicketError::DelegateExpired,
        close = original_owner
    )]
    pub delegate_authority: Account<'info, DelegateAuthority>,

    /// The new owner claiming the ticket
    #[account(mut)]
    pub new_owner: Signer<'info>,

    /// CHECK: Original owner receives rent back
    #[account(mut)]
    pub original_owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_delegate_transfer(
    ctx: Context<InitializeDelegateTransfer>,
    email_hash: [u8; 32],  // SHA256 hash of recipient email
    expires_in_hours: u64,
) -> Result<()> {
    let delegate = &mut ctx.accounts.delegate_authority;
    let ticket = &mut ctx.accounts.ticket;
    let clock = Clock::get()?;

    // Set up delegate authority
    delegate.ticket = ticket.key();
    delegate.original_owner = ctx.accounts.owner.key();
    delegate.email_hash = email_hash;
    delegate.created_at = clock.unix_timestamp;
    delegate.expires_at = clock.unix_timestamp + (expires_in_hours as i64 * 3600);
    delegate.claimed = false;
    delegate.claim_code = generate_claim_code(&ticket.key(), &email_hash);

    // Mark ticket as pending transfer
    ticket.pending_transfer = true;

    msg!("Delegate transfer initialized for ticket {}", ticket.ticket_id);

    Ok(())
}

pub fn complete_delegate_transfer(
    ctx: Context<CompleteDelegateTransfer>,
    email_hash: [u8; 32],
    claim_code: [u8; 16],
) -> Result<()> {
    let delegate = &ctx.accounts.delegate_authority;
    let ticket = &mut ctx.accounts.ticket;
    let clock = Clock::get()?;

    // Verify email hash and claim code
    require!(
        delegate.email_hash == email_hash,
        TicketError::InvalidEmailHash
    );
    require!(
        delegate.claim_code == claim_code,
        TicketError::InvalidClaimCode
    );

    // Transfer ownership
    ticket.owner = ctx.accounts.new_owner.key();
    ticket.pending_transfer = false;
    ticket.transfer_count = safe_add(ticket.transfer_count as u64, 1)? as u32;
    ticket.last_transfer_timestamp = clock.unix_timestamp;

    // Record delegate transfer
    ticket.delegate_transfer_history.push((
        delegate.original_owner,
        ctx.accounts.new_owner.key(),
        clock.unix_timestamp,
        email_hash,
    ));

    msg!("Ticket {} claimed by new owner via delegate transfer", ticket.ticket_id);

    Ok(())
}

// Helper function to generate claim code
fn generate_claim_code(ticket_key: &Pubkey, email_hash: &[u8; 32]) -> [u8; 16] {
    let mut hasher = anchor_lang::solana_program::hash::Hasher::default();
    hasher.hash(ticket_key.as_ref());
    hasher.hash(email_hash);
    let hash = hasher.result();
    let mut claim_code = [0u8; 16];
    claim_code.copy_from_slice(&hash.as_ref()[..16]);
    claim_code
}