use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod constants;
pub mod traits;
pub mod utils;

use instructions::*;
use state::{ValidationType, FreezeReason};

declare_id!("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");

#[program]
pub mod ticket_core {
    use super::*;
    
    // Event Management Instructions
    pub fn create_event(
        ctx: Context<CreateEventCtx>,
        name: String,
        venue: String,
        event_date: i64,
        total_tickets: u32,
        general_price: u64,
        vip_price: u64,
    ) -> Result<()> {
        instructions::create_event::create_event(
            ctx,
            name,
            venue,
            event_date,
            total_tickets,
            general_price,
            vip_price,
        )
    }
    
    pub fn update_event(
        ctx: Context<UpdateEvent>,
        name: Option<String>,
        description: Option<String>,
        venue: Option<String>,
        event_date: Option<i64>,
        ticket_price: Option<u64>,
    ) -> Result<()> {
        instructions::update_event::update_event(
            ctx,
            name,
            description,
            venue,
            event_date,
            ticket_price,
        )
    }
    
    pub fn cancel_event(ctx: Context<CancelEvent>, reason: String) -> Result<()> {
        instructions::cancel_event::cancel_event(ctx, reason)
    }
    
    // Ticket Minting Instructions
    pub fn mint_ticket(
        ctx: Context<MintTicketCtx>,
        tier: String,
        seat_number: Option<String>,
    ) -> Result<()> {
        instructions::mint_ticket::mint_ticket(ctx, tier, seat_number)
    }
    
    pub fn batch_mint(
        ctx: Context<BatchMintCtx>,
        count: u32,
        tier: String,
    ) -> Result<()> {
        instructions::batch_mint::batch_mint(ctx, count, tier)
    }
    
    pub fn reserve_tickets(
        ctx: Context<ReserveTicketsCtx>,
        count: u32,
    ) -> Result<()> {
        instructions::reserve_tickets::reserve_tickets(ctx, count)
    }
    
    pub fn mint_whitelist(
        ctx: Context<MintWhitelistCtx>,
        tier: String,
        seat_number: Option<String>,
    ) -> Result<()> {
        instructions::mint_whitelist::mint_whitelist(ctx, tier, seat_number)
    }
    
    // Transfer Instructions
    pub fn transfer_ticket(ctx: Context<TransferTicket>) -> Result<()> {
        instructions::transfer_ticket::transfer_ticket(ctx)
    }
    
    pub fn initialize_delegate_transfer(
        ctx: Context<InitializeDelegateTransfer>,
        email_hash: [u8; 32],
        expires_in_hours: u64,
    ) -> Result<()> {
        instructions::delegate_transfer::initialize_delegate_transfer(ctx, email_hash, expires_in_hours)
    }
    
    pub fn complete_delegate_transfer(
        ctx: Context<CompleteDelegateTransfer>,
        email_hash: [u8; 32],
        claim_code: [u8; 16],
    ) -> Result<()> {
        instructions::delegate_transfer::complete_delegate_transfer(ctx, email_hash, claim_code)
    }
    
    // Validation Instructions
    pub fn validate_entry(
        ctx: Context<ValidateEntry>,
        validation_type: ValidationType,
    ) -> Result<()> {
        instructions::validate_entry::validate_entry(ctx, validation_type)
    }
    
    // Ticket Management Instructions
    pub fn burn_ticket(ctx: Context<BurnTicket>) -> Result<()> {
        instructions::burn_ticket::burn_ticket(ctx)
    }
    
    pub fn mark_ticket_used(ctx: Context<MarkTicketUsed>) -> Result<()> {
        instructions::burn_ticket::mark_ticket_used(ctx)
    }
    
    // Freeze Instructions
    pub fn freeze_ticket(
        ctx: Context<FreezeTicket>,
        reason: FreezeReason,
    ) -> Result<()> {
        instructions::freeze_ticket::freeze_ticket(ctx, reason)
    }
    
    pub fn unfreeze_ticket(
        ctx: Context<UnfreezeTicket>,
        unfreeze_note: String,
    ) -> Result<()> {
        instructions::freeze_ticket::unfreeze_ticket(ctx, unfreeze_note)
    }
    
    // Refund Instructions
    pub fn request_refund(
        ctx: Context<RequestRefund>,
        reason: String,
    ) -> Result<()> {
        instructions::refunds::request_refund::request_refund(ctx, reason)
    }
    
    pub fn process_refund(
        ctx: Context<ProcessRefund>
    ) -> Result<()> {
        instructions::refunds::process_refund::process_refund(ctx)
    }
    
    pub fn cancel_refund(
        ctx: Context<CancelRefund>
    ) -> Result<()> {
        instructions::refunds::cancel_refund::cancel_refund(ctx)
    }
    
    // Admin Instructions
    pub fn emergency_pause(
        ctx: Context<EmergencyPause>
    ) -> Result<()> {
        instructions::admin::emergency_pause::emergency_pause(ctx)
    }
    
    pub fn emergency_unpause(
        ctx: Context<EmergencyUnpause>
    ) -> Result<()> {
        instructions::admin::emergency_unpause::emergency_unpause(ctx)
    }
    
    pub fn set_compliance(
        ctx: Context<SetCompliance>
    ) -> Result<()> {
        instructions::admin::set_compliance::set_compliance(ctx)
    }
    
    pub fn update_authorities(
        ctx: Context<UpdateAuthorities>
    ) -> Result<()> {
        instructions::admin::update_authorities::update_authorities(ctx)
    }
}