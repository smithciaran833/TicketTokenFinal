use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::TicketError;
use crate::utils::math::*;

#[derive(Accounts)]
pub struct RequestRefund<'info> {
    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), ticket.ticket_id.to_le_bytes().as_ref()],
        bump,
        constraint = ticket.owner == buyer.key() @ TicketError::NotTicketOwner,
        constraint = !ticket.used @ TicketError::TicketAlreadyUsed,
        constraint = ticket.status == TicketStatus::Valid @ TicketError::RefundNotEligible,
        constraint = ticket.refund_eligible @ TicketError::RefundNotEligible
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        mut,
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump,
        constraint = !event.cancelled @ TicketError::EventCancelled
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        payer = buyer,
        space = RefundRequest::LEN,
        seeds = [b"refund", ticket.key().as_ref()],
        bump
    )]
    pub refund_request: Account<'info, RefundRequest>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Event treasury that holds funds
    #[account(
        mut,
        constraint = event_treasury.key() == event.treasury @ TicketError::Unauthorized
    )]
    pub event_treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct RefundRequest {
    pub ticket: Pubkey,
    pub requester: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub requested_at: i64,
    pub status: RefundStatus,
    pub processed_at: Option<i64>,
    pub processor: Option<Pubkey>,
}

impl RefundRequest {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 200 + 8 + 1 + 9 + 33 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum RefundStatus {
    Pending,
    Approved,
    Rejected,
    Cancelled,
}

pub fn request_refund(
    ctx: Context<RequestRefund>,
    reason: String,
) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    let event = &ctx.accounts.event;
    let refund_request = &mut ctx.accounts.refund_request;
    let clock = Clock::get()?;

    // Check refund deadline
    if let Some(deadline) = ticket.refund_deadline {
        require!(
            clock.unix_timestamp < deadline,
            TicketError::RefundWindowClosed
        );
    } else {
        // Use event start time minus refund window
        require!(
            clock.unix_timestamp < event.start_time - REFUND_WINDOW_SECONDS,
            TicketError::RefundWindowClosed
        );
    }

    // Calculate refund amount based on policy
    let refund_amount = calculate_refund_amount(
        &event.refund_policy,
        ticket.purchase_price,
        event.start_time,
        clock.unix_timestamp
    )?;

    // Create refund request
    refund_request.ticket = ticket.key();
    refund_request.requester = ctx.accounts.buyer.key();
    refund_request.amount = refund_amount;
    refund_request.reason = reason;
    refund_request.requested_at = clock.unix_timestamp;
    refund_request.status = RefundStatus::Pending;

    // Update ticket status
    ticket.status = TicketStatus::Refunded;
    ticket.refund_eligible = false;

    // Process immediate refund if amount is small
    if refund_amount < 1_000_000 { // 0.001 SOL
        // Transfer refund immediately
        **ctx.accounts.buyer.lamports.borrow_mut() = safe_add(
            ctx.accounts.buyer.lamports(),
            refund_amount
        )?;
        **ctx.accounts.event_treasury.lamports.borrow_mut() = safe_sub(
            ctx.accounts.event_treasury.lamports(),
            refund_amount
        )?;

        refund_request.status = RefundStatus::Approved;
        refund_request.processed_at = Some(clock.unix_timestamp);
        
        ticket.refunded_at = Some(clock.unix_timestamp);
        ticket.refund_amount = Some(refund_amount);
        ticket.refund_reason = Some(refund_request.reason.clone());
    }

    // Update event stats
    event.tickets_sold = safe_sub(event.tickets_sold as u64, 1)? as u32;
    if ticket.tier_index < event.tiers.len() {
        event.tiers[ticket.tier_index].refunded_count = safe_add(
            event.tiers[ticket.tier_index].refunded_count as u64,
            1
        )? as u32;
    }

    msg!("Refund requested for ticket {} amount: {}", ticket.ticket_id, refund_amount);

    Ok(())
}

fn calculate_refund_amount(
    policy: &RefundPolicy,
    purchase_price: u64,
    event_start: i64,
    current_time: i64,
) -> Result<u64> {
    let hours_until_event = ((event_start - current_time) / 3600) as u32;
    
    match policy {
        RefundPolicy::NoRefunds => Ok(0),
        
        RefundPolicy::FullRefund { hours_before_event } => {
            if hours_until_event >= *hours_before_event {
                Ok(purchase_price)
            } else {
                Ok(0)
            }
        },
        
        RefundPolicy::TieredRefund { tiers } => {
            for tier in tiers {
                if hours_until_event >= tier.hours_before {
                    let refund_base = calculate_percentage(
                        purchase_price,
                        tier.refund_percentage as u16 * 100
                    )?;
                    let platform_fee = calculate_percentage(
                        purchase_price,
                        tier.fee_basis_points
                    )?;
                    return safe_sub(refund_base, platform_fee);
                }
            }
            Ok(0)
        },
        
        RefundPolicy::CustomPolicy { .. } => {
            // Custom handler would process this
            Ok(purchase_price / 2) // Default 50%
        }
    }
}

use crate::constants::REFUND_WINDOW_SECONDS;
