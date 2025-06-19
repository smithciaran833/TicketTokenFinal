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
    
    pub fn create_event(
        ctx: Context<CreateEventCtx>,
        name: String,
        venue: String,
        event_date: i64,
        total_tickets: u32,
        general_price: u64,
        vip_price: u64,
    ) -> Result<()> {
        instructions::create_event(
            ctx,
            name,
            venue,
            event_date,
            total_tickets,
            general_price,
            vip_price
        )
    }
    
    pub fn update_event(
        ctx: Context<UpdateEventCtx>,
        new_venue: Option<String>,
        new_event_date: Option<i64>,
        new_general_price: Option<u64>,
        new_vip_price: Option<u64>,
    ) -> Result<()> {
        instructions::update_event(
            ctx,
            new_venue,
            new_event_date,
            new_general_price,
            new_vip_price
        )
    }
    
    pub fn cancel_event(ctx: Context<CancelEventCtx>) -> Result<()> {
        instructions::cancel_event(ctx)
    }
    
    pub fn mint_ticket(
        ctx: Context<MintTicketCtx>,
        tier: String,
    ) -> Result<()> {
        instructions::mint_ticket(ctx, tier)
    }
    
    pub fn batch_mint(
        ctx: Context<BatchMintCtx>,
        tier: String,
        quantity: u32,
    ) -> Result<()> {
        instructions::batch_mint(ctx, tier, quantity)
    }
    
    pub fn reserve_tickets(
        ctx: Context<ReserveTicketsCtx>,
        quantity: u32,
    ) -> Result<()> {
        instructions::reserve_tickets(ctx, quantity)
    }
    
    pub fn mint_whitelist(
        ctx: Context<MintWhitelistCtx>,
        tier: String,
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        instructions::mint_whitelist(ctx, tier, proof)
    }
    
    // Days 6-7: Transfer & Validation Instructions
    
    pub fn transfer_ticket(
        ctx: Context<TransferTicket>,
        transfer_memo: Option<String>,
    ) -> Result<()> {
        instructions::transfer_ticket(ctx, transfer_memo)
    }
    
    pub fn initialize_delegate_transfer(
        ctx: Context<InitializeDelegateTransfer>,
        email_hash: [u8; 32],
        expires_in_hours: u64,
    ) -> Result<()> {
        instructions::initialize_delegate_transfer(ctx, email_hash, expires_in_hours)
    }
    
    pub fn complete_delegate_transfer(
        ctx: Context<CompleteDelegateTransfer>,
        email_hash: [u8; 32],
        claim_code: [u8; 16],
    ) -> Result<()> {
        instructions::complete_delegate_transfer(ctx, email_hash, claim_code)
    }
    
    pub fn validate_entry(
        ctx: Context<ValidateEntry>,
        gate_id: String,
        validation_type: ValidationType,
    ) -> Result<()> {
        instructions::validate_entry(ctx, gate_id, validation_type)
    }
    
    pub fn burn_ticket(ctx: Context<BurnTicket>) -> Result<()> {
        instructions::burn_ticket(ctx)
    }
    
    pub fn mark_ticket_used(ctx: Context<MarkTicketUsed>) -> Result<()> {
        instructions::mark_ticket_used(ctx)
    }
    
    pub fn freeze_ticket(
        ctx: Context<FreezeTicket>,
        reason: FreezeReason,
        evidence: String,
    ) -> Result<()> {
        instructions::freeze_ticket(ctx, reason, evidence)
    }
    
    pub fn unfreeze_ticket(
        ctx: Context<UnfreezeTicket>,
        unfreeze_note: String,
    ) -> Result<()> {
        instructions::unfreeze_ticket(ctx, unfreeze_note)
    }
    
    // New 10/10 Instructions
    
    pub fn request_refund(
        ctx: Context<RequestRefund>,
        reason: String,
    ) -> Result<()> {
        instructions::request_refund(ctx, reason)
    }
    
    pub fn emergency_pause(
        ctx: Context<EmergencyPause>,
        reason: String,
    ) -> Result<()> {
        instructions::emergency_pause(ctx, reason)
    }
}
