use anchor_lang::prelude::*;

#[account]
pub struct ComplianceConfig {
    pub version: u8,
    pub authority: Pubkey,
    pub kyc_required: bool,
    pub kyc_provider: Option<Pubkey>,
    pub aml_required: bool,
    pub aml_threshold: u64,                 // Amount that triggers AML
    pub age_restriction: Option<u8>,        // Minimum age
    pub blocked_regions: Vec<[u8; 2]>,      // ISO country codes
    pub whitelist_only: bool,               // Only whitelisted wallets
    pub sanctions_list: Option<Pubkey>,     // Link to sanctions oracle
    pub reporting_enabled: bool,            // Generate compliance reports
    pub data_retention_days: u32,           // How long to keep data
}

#[account]
pub struct UserCompliance {
    pub wallet: Pubkey,
    pub kyc_status: KycStatus,
    pub kyc_timestamp: Option<i64>,
    pub kyc_expiry: Option<i64>,
    pub aml_score: Option<u8>,              // 0-100 risk score
    pub region: Option<[u8; 2]>,            // User's region
    pub age_verified: Option<u8>,           // Verified age
    pub total_spent: u64,                   // For AML tracking
    pub flagged: bool,                      // Suspicious activity
    pub verified_by: Option<Pubkey>,        // KYC provider
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum KycStatus {
    NotStarted,
    Pending,
    Approved,
    Rejected,
    Expired,
}
