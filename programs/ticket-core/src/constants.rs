//! Global constants for the ticket system
pub const MAX_EVENT_NAME_LEN: usize = 100;
pub const MAX_VENUE_NAME_LEN: usize = 100;
pub const MAX_BATCH_SIZE: u32 = 100;
pub const MAX_GATE_STAFF: usize = 50;
pub const MAX_TRANSFER_HISTORY: usize = 100;
pub const REFUND_WINDOW_SECONDS: i64 = 86400; // 24 hours
pub const SURGE_PRICING_THRESHOLD: f64 = 0.8; // 80% capacity
pub const MAX_REFUND_REASON_LEN: usize = 200;
pub const PLATFORM_FEE_BASIS_POINTS: u16 = 250; // 2.5%

// String length limits
pub const MAX_NAME_LENGTH: usize = 100;
pub const MAX_DESCRIPTION_LENGTH: usize = 500;
pub const MAX_VENUE_LENGTH: usize = 200;
