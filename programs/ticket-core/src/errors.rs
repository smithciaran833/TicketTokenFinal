use anchor_lang::prelude::*;

#[error_code]
pub enum TicketError {
    // Event Management Errors (1000-1099)
    #[msg("E1001: Event name too long (max 50 characters)")]
    EventNameTooLong = 1001,

    #[msg("E1002: Event name cannot be empty")]
    EventNameEmpty = 1002,

    #[msg("E1003: Description too long (max 200 characters)")]
    DescriptionTooLong = 1003,

    #[msg("E1004: Description cannot be empty")]
    DescriptionEmpty = 1004,

    #[msg("E1005: Venue name too long (max 100 characters)")]
    VenueTooLong = 1005,

    #[msg("E1006: Venue name cannot be empty")]
    VenueEmpty = 1006,

    #[msg("E1007: Event date must be in the future")]
    InvalidEventDate = 1007,

    #[msg("E1008: Event not found")]
    EventNotFound = 1008,

    #[msg("E1009: Event has been cancelled")]
    EventCancelled = 1009,

    #[msg("E1010: Cannot update event after it has started")]
    EventAlreadyStarted = 1010,

    #[msg("E1011: Cannot cancel event after it has started")]
    CannotCancelStartedEvent = 1011,

    #[msg("E1012: Event already exists")]
    EventAlreadyExists = 1012,

    #[msg("E1013: Invalid ticket count")]
    InvalidTicketCount = 1013,

    #[msg("E1014: Event has already been cancelled")]
    EventAlreadyCancelled = 1014,

    #[msg("E1015: Name exceeds maximum length")]
    NameTooLong = 1015,

    #[msg("E1016: Invalid event dates")]
    InvalidEventDates = 1016,

    // Ticket Errors (2000-2099)
    #[msg("E2001: Invalid ticket price (must be greater than 0)")]
    InvalidTicketPrice = 2001,

    #[msg("E2002: No tickets available")]
    EventFull = 2002,

    #[msg("E2003: Ticket not found")]
    TicketNotFound = 2003,

    #[msg("E2004: Ticket has already been validated")]
    AlreadyValidated = 2004,

    #[msg("E2005: Invalid ticket tier")]
    InvalidTier = 2005,

    #[msg("E2006: Ticket is frozen")]
    TicketFrozen = 2006,

    #[msg("E2007: Maximum tickets per wallet exceeded")]
    MaximumTicketsExceeded = 2007,

    #[msg("E2008: No active reservation")]
    NoActiveReservation = 2008,

    #[msg("E2009: Reservation expired")]
    ReservationExpired = 2009,

    #[msg("E2010: Invalid validation type")]
    InvalidValidationType = 2010,

    // Transfer Errors (3000-3099)
    #[msg("E3001: Transfer not allowed for this ticket")]
    TransferNotAllowed = 3001,

    #[msg("E3002: Delegation not allowed for this ticket")]
    DelegationNotAllowed = 3002,

    #[msg("E3003: Ticket already delegated")]
    AlreadyDelegated = 3003,

    #[msg("E3004: Invalid delegate address")]
    InvalidDelegate = 3004,

    #[msg("E3005: Cannot delegate to self")]
    SelfDelegationNotAllowed = 3005,

    // Access Control Errors (4000-4099)
    #[msg("E4001: Unauthorized access")]
    Unauthorized = 4001,

    #[msg("E4002: Whitelist required for this event")]
    WhitelistRequired = 4002,

    #[msg("E4003: Address not whitelisted")]
    NotWhitelisted = 4003,

    #[msg("E4004: Address already whitelisted")]
    AlreadyWhitelisted = 4004,

    #[msg("E4005: Invalid compliance level")]
    InvalidComplianceLevel = 4005,

    // Financial Errors (5000-5099)
    #[msg("E5001: Insufficient funds")]
    InsufficientFunds = 5001,

    #[msg("E5002: Invalid amount")]
    InvalidAmount = 5002,

    #[msg("E5003: Refund period expired")]
    RefundPeriodExpired = 5003,

    #[msg("E5004: Refund already requested")]
    RefundAlreadyRequested = 5004,

    #[msg("E5005: No refund requested")]
    NoRefundRequested = 5005,

    #[msg("E5006: Invalid refund status")]
    InvalidRefundStatus = 5006,

    #[msg("E5007: Already refunded")]
    AlreadyRefunded = 5007,

    // System Errors (6000-6099)
    #[msg("E6001: System is paused")]
    SystemPaused = 6001,

    #[msg("E6002: System is already paused")]
    AlreadyPaused = 6002,

    #[msg("E6003: System is not paused")]
    NotPaused = 6003,

    #[msg("E6004: Invalid freeze reason")]
    InvalidFreezeReason = 6004,

    #[msg("E6005: Arithmetic overflow")]
    ArithmeticOverflow = 6005,

    #[msg("E6006: Invalid account")]
    InvalidAccount = 6006,

    // Metadata Errors (7000-7099)
    #[msg("E7001: Invalid metadata")]
    InvalidMetadata = 7001,
}