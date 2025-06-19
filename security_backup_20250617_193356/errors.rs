use anchor_lang::prelude::*;

#[error_code]
pub enum TicketError {
    // Event Management Errors (1000-1099)
    #[msg("E1001: Event name too long (max 50 characters)")]
    EventNameTooLong = 1001,
    
    #[msg("E1002: Event name cannot be empty")]
    EventNameEmpty = 1002,
    
    #[msg("E1003: Invalid characters in event name")]
    InvalidCharacters = 1003,
    
    #[msg("E1004: Event date must be in the future")]
    InvalidEventDate = 1004,
    
    #[msg("E1005: Event is sold out")]
    EventSoldOut = 1005,
    
    #[msg("E1006: Event has been cancelled")]
    EventCancelled = 1006,
    
    #[msg("E1007: Cannot cancel event - tickets have been sold")]
    EventHasTicketsSold = 1007,
    
    #[msg("E1008: Event not started yet")]
    EventNotStarted = 1008,
    
    #[msg("E1009: Event has ended")]
    EventEnded = 1009,
    
    #[msg("E1010: Event is paused")]
    EventPaused = 1010,
    
    // Ticket Errors (1100-1199)
    #[msg("E1101: Invalid ticket price")]
    InvalidPrice = 1101,
    
    #[msg("E1102: Not enough SOL to purchase ticket")]
    InsufficientFunds = 1102,
    
    #[msg("E1103: Invalid ticket tier selected")]
    InvalidTicketTier = 1103,
    
    #[msg("E1104: Ticket already used")]
    TicketAlreadyUsed = 1104,
    
    #[msg("E1105: Ticket is frozen")]
    TicketFrozen = 1105,
    
    #[msg("E1106: Not the ticket owner")]
    NotTicketOwner = 1106,
    
    #[msg("E1107: Ticket not validated")]
    TicketNotValidated = 1107,
    
    #[msg("E1108: Already validated for entry")]
    AlreadyValidatedForEntry = 1108,
    
    // Transfer Errors (1200-1299)
    #[msg("E1201: Transfers not allowed for this event")]
    TransfersNotAllowed = 1201,
    
    #[msg("E1202: Transfer window has closed")]
    TransferWindowClosed = 1202,
    
    #[msg("E1203: Invalid delegate authority")]
    InvalidDelegateAuthority = 1203,
    
    #[msg("E1204: Delegate transfer already claimed")]
    DelegateAlreadyClaimed = 1204,
    
    #[msg("E1205: Delegate transfer expired")]
    DelegateExpired = 1205,
    
    #[msg("E1206: Invalid email hash")]
    InvalidEmailHash = 1206,
    
    #[msg("E1207: Invalid claim code")]
    InvalidClaimCode = 1207,
    
    // Authorization Errors (1300-1399)
    #[msg("E1301: Unauthorized - only event authority can perform this action")]
    Unauthorized = 1301,
    
    #[msg("E1302: Unauthorized validator")]
    UnauthorizedValidator = 1302,
    
    #[msg("E1303: Unauthorized burner")]
    UnauthorizedBurner = 1303,
    
    #[msg("E1304: Unauthorized freezer")]
    UnauthorizedFreezer = 1304,
    
    #[msg("E1305: Unauthorized unfreezer")]
    UnauthorizedUnfreezer = 1305,
    
    #[msg("E1306: Insufficient signers for multisig")]
    InsufficientSigners = 1306,
    
    // Batch Operation Errors (1400-1499)
    #[msg("E1401: Insufficient capacity for batch mint")]
    InsufficientCapacity = 1401,
    
    #[msg("E1402: Batch size too large (max 100)")]
    BatchSizeTooLarge = 1402,
    
    // Whitelist Errors (1500-1599)
    #[msg("E1501: Whitelist period has expired")]
    WhitelistExpired = 1501,
    
    // Freeze Errors (1600-1699)
    #[msg("E1601: Ticket already frozen")]
    TicketAlreadyFrozen = 1601,
    
    #[msg("E1602: Ticket not frozen")]
    TicketNotFrozen = 1602,
    
    // Math Errors (1700-1799)
    #[msg("E1701: Math overflow in calculation")]
    MathOverflow = 1701,
    
    #[msg("E1702: Math underflow in calculation")]
    MathUnderflow = 1702,
    
    // Refund Errors (2000-2099)
    #[msg("E2001: Refund window has closed")]
    RefundWindowClosed = 2001,
    
    #[msg("E2002: Refund amount exceeds purchase price")]
    RefundAmountInvalid = 2002,
    
    #[msg("E2003: Ticket not eligible for refund")]
    RefundNotEligible = 2003,
    
    #[msg("E2004: Refund already processed")]
    RefundAlreadyProcessed = 2004,
    
    #[msg("E2005: No refund policy set")]
    NoRefundPolicy = 2005,
    
    // Security Errors (3000-3099)
    #[msg("E3001: Program is paused for emergency")]
    ProgramPaused = 3001,
    
    #[msg("E3002: Rate limit exceeded")]
    RateLimitExceeded = 3002,
    
    #[msg("E3003: Suspicious activity detected")]
    SuspiciousActivity = 3003,
    
    // Compliance Errors (4000-4099)
    #[msg("E4001: KYC verification required")]
    KycRequired = 4001,
    
    #[msg("E4002: Geographic region blocked")]
    RegionBlocked = 4002,
    
    #[msg("E4003: Age verification required")]
    AgeVerificationRequired = 4003,
    
    #[msg("E4004: AML threshold exceeded")]
    AmlThresholdExceeded = 4004,
    
    #[msg("E4005: Wallet is sanctioned")]
    WalletSanctioned = 4005,
    
    // Validation Errors (5000-5099)
    #[msg("E5001: Invalid date range")]
    InvalidDateRange = 5001,
    
    #[msg("E5002: Price out of allowed range")]
    PriceOutOfRange = 5002,
    
    #[msg("E5003: Maximum tickets per wallet exceeded")]
    MaxTicketsPerWalletExceeded = 5003,
    #[msg("Event start time is in the past")]
    EventInPast,
}
