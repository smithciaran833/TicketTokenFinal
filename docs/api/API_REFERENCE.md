# 📚 API Reference - Solana NFT Ticketing System

## Table of Contents
- [Overview](#overview)
- [Program Instructions](#program-instructions)
- [Account Structures](#account-structures)
- [Error Codes](#error-codes)
- [PDA Derivations](#pda-derivations)
- [Constants & Limits](#constants--limits)

## Overview

**Program ID**: `EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm`

The Solana NFT Ticketing System provides 15 core instructions for managing events, tickets, transfers, and validation.

## Program Instructions

### 1. create_event

Creates a new event with configurable parameters.

**Accounts:**
- `event` - Event account PDA (mut, signer)
- `authority` - Event organizer (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn create_event(
    ctx: Context<CreateEventCtx>,
    name: String,              // Max 100 chars
    venue: String,             // Max 100 chars
    event_date: i64,           // Unix timestamp
    total_tickets: u32,        // Total capacity
    general_price: u64,        // Lamports
    vip_price: u64,           // Lamports
) -> Result<()>
```

**Validation:**
- Name must be ≤ 100 characters
- Event date must be in the future
- Prices must be > 0
- Total tickets must be > 0

### 2. update_event

Updates existing event details.

**Accounts:**
- `event` - Event account (mut)
- `authority` - Event organizer (signer)

**Arguments:**
```rust
pub fn update_event(
    ctx: Context<UpdateEventCtx>,
    new_venue: Option<String>,
    new_event_date: Option<i64>,
    new_general_price: Option<u64>,
    new_vip_price: Option<u64>,
) -> Result<()>
```

**Restrictions:**
- Only organizer can update
- Cannot change prices after sales begin
- Cannot change date to past

### 3. cancel_event

Cancels an event (with restrictions).

**Accounts:**
- `event` - Event account (mut)
- `authority` - Event organizer (signer)

**Arguments:** None

**Validation:**
- Cannot cancel if tickets sold (unless emergency)
- Sets `cancelled` flag to true

### 4. mint_ticket

Mints a single ticket NFT.

**Accounts:**
- `ticket` - Ticket PDA (mut)
- `event` - Event account (mut)
- `buyer` - Ticket purchaser (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn mint_ticket(
    ctx: Context<MintTicketCtx>,
    tier: String,  // "general" or "vip"
) -> Result<()>
```

**Process:**
1. Verify payment amount
2. Check ticket availability
3. Create ticket account
4. Update event counters

### 5. batch_mint

Mints multiple tickets in one transaction.

**Accounts:**
- `event` - Event account (mut)
- `buyer` - Ticket purchaser (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn batch_mint(
    ctx: Context<BatchMintCtx>,
    tier: String,
    quantity: u32,  // Max 100
) -> Result<()>
```

**Limits:**
- Maximum 100 tickets per batch
- All tickets same tier

### 6. reserve_tickets

Reserves tickets for organizer distribution.

**Accounts:**
- `event` - Event account (mut)
- `authority` - Event organizer (signer)

**Arguments:**
```rust
pub fn reserve_tickets(
    ctx: Context<ReserveTicketsCtx>,
    quantity: u32,
) -> Result<()>
```

### 7. mint_whitelist

Mints tickets for whitelisted addresses.

**Accounts:**
- `ticket` - Ticket PDA (mut)
- `event` - Event account (mut)
- `whitelist` - Whitelist account
- `buyer` - Whitelisted buyer (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn mint_whitelist(
    ctx: Context<MintWhitelistCtx>,
    tier: String,
    proof: Vec<[u8; 32]>,  // Merkle proof
) -> Result<()>
```

### 8. transfer_ticket

P2P ticket transfer between wallets.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `from` - Current owner (signer)
- `to` - New owner
- `system_program` - System program

**Arguments:**
```rust
pub fn transfer_ticket(
    ctx: Context<TransferTicket>,
    transfer_memo: Option<String>,  // Max 200 chars
) -> Result<()>
```

**Validation:**
- Ticket not used
- Ticket not frozen
- Transfers allowed for event
- Within transfer window

### 9. initialize_delegate_transfer

Starts email-based transfer process.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `delegate_authority` - Delegate PDA (init)
- `owner` - Current owner (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn initialize_delegate_transfer(
    ctx: Context<InitializeDelegateTransfer>,
    email_hash: [u8; 32],      // SHA256 of email
    expires_in_hours: u64,     // Expiration time
) -> Result<()>
```

### 10. complete_delegate_transfer

Completes email-based transfer.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `delegate_authority` - Delegate PDA (mut, close)
- `new_owner` - Claiming wallet (signer)
- `original_owner` - Previous owner
- `system_program` - System program

**Arguments:**
```rust
pub fn complete_delegate_transfer(
    ctx: Context<CompleteDelegateTransfer>,
    email_hash: [u8; 32],
    claim_code: [u8; 16],
) -> Result<()>
```

### 11. validate_entry

Validates ticket at event entry.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `validation_record` - Validation PDA (init)
- `validator` - Gate staff (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn validate_entry(
    ctx: Context<ValidateEntry>,
    gate_id: String,
    validation_type: ValidationType,
) -> Result<()>
```

**Validation Types:**
- `Entry` - Main entrance
- `Exit` - Exit scan
- `Checkpoint` - Internal checkpoints

### 12. burn_ticket

Permanently destroys a used ticket.

**Accounts:**
- `ticket` - Ticket account (mut, close)
- `event` - Event account (mut)
- `ticket_owner` - Owner (receives rent)
- `authority` - Organizer/burner (signer)
- `system_program` - System program

**Arguments:** None

**Effects:**
- Closes ticket account
- Returns rent to owner
- Updates event counters

### 13. mark_ticket_used

Marks ticket as used without burning.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account (mut)
- `authority` - Organizer/staff (signer)

**Arguments:** None

### 14. freeze_ticket

Freezes suspicious ticket.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `freeze_record` - Freeze PDA (init)
- `authority` - Freeze authority (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn freeze_ticket(
    ctx: Context<FreezeTicket>,
    reason: FreezeReason,
    evidence: String,  // Max 200 chars
) -> Result<()>
```

**Freeze Reasons:**
- `SuspectedFraud`
- `DuplicateDetected`
- `PaymentIssue`
- `SecurityConcern`
- `LegalHold`
- `Other`

### 15. unfreeze_ticket

Unfreezes a frozen ticket.

**Accounts:**
- `ticket` - Ticket account (mut)
- `event` - Event account
- `freeze_record` - Freeze PDA (mut, close)
- `authority` - Organizer only (mut, signer)
- `system_program` - System program

**Arguments:**
```rust
pub fn unfreeze_ticket(
    ctx: Context<UnfreezeTicket>,
    unfreeze_note: String,
) -> Result<()>
```

## Account Structures

### Event Account
```rust
pub struct Event {
    pub event_id: u64,              // 8 bytes
    pub organizer: Pubkey,          // 32 bytes
    pub authority: Pubkey,          // 32 bytes
    pub name: String,               // 100 bytes max
    pub venue: String,              // 100 bytes max
    pub event_date: i64,            // 8 bytes (deprecated)
    pub start_time: i64,            // 8 bytes
    pub end_time: i64,              // 8 bytes
    pub total_tickets: u32,         // 4 bytes
    pub tickets_sold: u32,          // 4 bytes
    pub tickets_used: u32,          // 4 bytes
    pub tickets_burned: u32,        // 4 bytes
    pub general_price: u64,         // 8 bytes
    pub vip_price: u64,             // 8 bytes
    pub cancelled: bool,            // 1 byte
    pub transferable: bool,         // 1 byte
    pub transfer_freeze_time: Option<i64>, // 9 bytes
    pub gate_staff: Vec<Pubkey>,    // Variable
    pub freeze_authorities: Vec<Pubkey>, // Variable
    pub burn_authorities: Vec<Pubkey>,   // Variable
    pub tiers: Vec<TicketTier>,     // Variable
    pub bump: u8,                   // 1 byte
}
```

### Ticket Account
```rust
pub struct Ticket {
    pub ticket_id: u64,             // 8 bytes
    pub event: Pubkey,              // 32 bytes
    pub owner: Pubkey,              // 32 bytes
    pub original_owner: Pubkey,     // 32 bytes
    pub tier_index: usize,          // 8 bytes
    pub purchase_price: u64,        // 8 bytes
    pub purchased_at: i64,          // 8 bytes
    pub used: bool,                 // 1 byte
    pub used_at: Option<i64>,       // 9 bytes
    pub is_frozen: bool,            // 1 byte
    pub freeze_timestamp: Option<i64>, // 9 bytes
    pub unfreeze_timestamp: Option<i64>, // 9 bytes
    pub entry_validated: bool,      // 1 byte
    pub entry_time: Option<i64>,    // 9 bytes
    pub entry_gate: Option<String>, // 50 bytes max
    pub exit_time: Option<i64>,     // 9 bytes
    pub exit_gate: Option<String>,  // 50 bytes max
    pub transfer_count: u32,        // 4 bytes
    pub last_transfer_timestamp: i64, // 8 bytes
    pub pending_transfer: bool,     // 1 byte
    pub validation_count: u32,      // 4 bytes
    pub last_validated: i64,        // 8 bytes
    pub checkpoint_scans: Vec<(String, i64)>, // Variable
    pub transfer_history: Vec<(Pubkey, Pubkey, i64, String)>, // Variable
    pub delegate_transfer_history: Vec<(Pubkey, Pubkey, i64, [u8; 32])>, // Variable
    pub metadata_uri: String,       // 200 bytes max
    pub bump: u8,                   // 1 byte
}
```

### DelegateAuthority Account
```rust
pub struct DelegateAuthority {
    pub ticket: Pubkey,             // 32 bytes
    pub original_owner: Pubkey,     // 32 bytes
    pub email_hash: [u8; 32],       // 32 bytes
    pub claim_code: [u8; 16],       // 16 bytes
    pub created_at: i64,            // 8 bytes
    pub expires_at: i64,            // 8 bytes
    pub claimed: bool,              // 1 byte
}
```

Size: 137 bytes + 64 padding = 201 bytes

### ValidationRecord Account
```rust
pub struct ValidationRecord {
    pub ticket: Pubkey,             // 32 bytes
    pub validator: Pubkey,          // 32 bytes
    pub timestamp: i64,             // 8 bytes
    pub gate_id: String,            // 50 bytes max
    pub validation_type: ValidationType, // 1 byte
}
```

Size: 123 bytes + 64 padding = 187 bytes

### FreezeRecord Account
```rust
pub struct FreezeRecord {
    pub ticket: Pubkey,             // 32 bytes
    pub frozen_by: Pubkey,          // 32 bytes
    pub freeze_timestamp: i64,      // 8 bytes
    pub reason: FreezeReason,       // 1 byte
    pub evidence: String,           // 200 bytes max
    pub unfrozen: bool,             // 1 byte
    pub unfrozen_by: Option<Pubkey>, // 33 bytes
    pub unfreeze_timestamp: Option<i64>, // 9 bytes
    pub unfreeze_note: Option<String>, // 200 bytes max
}
```

Size: 516 bytes + 64 padding = 580 bytes

## Error Codes

```rust
pub enum TicketError {
    EventNameTooLong,           // Name > 50 chars
    EventSoldOut,               // No tickets available
    InvalidPrice,               // Price = 0
    InvalidEventDate,           // Date in past
    InsufficientFunds,          // Not enough SOL
    InvalidTicketTier,          // Unknown tier
    Unauthorized,               // Wrong authority
    EventHasTicketsSold,        // Can't cancel
    InsufficientCapacity,       // Not enough tickets
    BatchSizeTooLarge,          // > 100 tickets
    MathOverflow,               // Calculation error
    WhitelistExpired,           // Presale ended
    NotTicketOwner,             // Not the owner
    TicketAlreadyUsed,          // Already used
    TicketFrozen,               // Security freeze
    EventCancelled,             // Event cancelled
    TransfersNotAllowed,        // No transfers
    TransferWindowClosed,       // Too late
    InvalidDelegateAuthority,   // Wrong delegate
    DelegateAlreadyClaimed,     // Already claimed
    DelegateExpired,            // Link expired
    InvalidEmailHash,           // Wrong email
    InvalidClaimCode,           // Wrong code
    UnauthorizedValidator,      // Not gate staff
    EventNotStarted,            // Too early
    EventEnded,                 // Too late
    AlreadyValidatedForEntry,   // Already entered
    TicketNotValidated,         // Not scanned
    UnauthorizedBurner,         // Can't burn
    TicketAlreadyFrozen,        // Already frozen
    TicketNotFrozen,            // Not frozen
    UnauthorizedFreezer,        // Can't freeze
    UnauthorizedUnfreezer,      // Can't unfreeze
}
```

## PDA Derivations

### Event PDA
```rust
let (event_pda, bump) = Pubkey::find_program_address(
    &[b"event", event_id.to_le_bytes().as_ref()],
    &program_id
);
```

### Ticket PDA
```rust
let (ticket_pda, bump) = Pubkey::find_program_address(
    &[
        b"ticket", 
        event_pubkey.as_ref(), 
        ticket_id.to_le_bytes().as_ref()
    ],
    &program_id
);
```

### Delegate Authority PDA
```rust
let (delegate_pda, bump) = Pubkey::find_program_address(
    &[b"delegate", ticket_pubkey.as_ref()],
    &program_id
);
```

### Validation Record PDA
```rust
let (validation_pda, bump) = Pubkey::find_program_address(
    &[
        b"validation", 
        ticket_pubkey.as_ref(),
        timestamp.to_le_bytes().as_ref()
    ],
    &program_id
);
```

### Freeze Record PDA
```rust
let (freeze_pda, bump) = Pubkey::find_program_address(
    &[b"freeze", ticket_pubkey.as_ref()],
    &program_id
);
```

### Whitelist PDA
```rust
let (whitelist_pda, bump) = Pubkey::find_program_address(
    &[b"whitelist", event_pubkey.as_ref()],
    &program_id
);
```

## Constants & Limits

### String Limits
- Event name: 100 characters
- Venue name: 100 characters
- Transfer memo: 200 characters
- Evidence string: 200 characters
- Metadata URI: 200 characters
- Gate ID: 50 characters

### Numeric Limits
- Batch mint: 100 tickets maximum
- Transfer history: Unlimited (dynamic array)
- Gate staff: Unlimited (dynamic array)
- Ticket tiers: Unlimited (dynamic array)

### Time Limits
- Delegate transfer: Configurable expiration
- Event validation: Start time to end time + 1 hour
- Transfer freeze: Optional, configurable per event

### Financial Limits
- Minimum price: 0 (free tickets allowed)
- Maximum price: u64::MAX lamports
- Refunds: Not implemented (future feature)

## Best Practices

1. **Always verify PDAs** before passing to instructions
2. **Check balances** before minting operations
3. **Handle errors gracefully** - all operations can fail
4. **Use appropriate signers** - most operations require specific authorities
5. **Monitor gas usage** - batch operations cost more
6. **Validate inputs** client-side to save failed transactions
7. **Keep transfer memos short** to minimize transaction size
8. **Use delegate transfers** for non-crypto users
9. **Implement retry logic** for network failures
10. **Cache account data** to minimize RPC calls