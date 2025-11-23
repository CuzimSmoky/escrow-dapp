use anchor_lang::prelude::*;

#[error_code]
pub enum MicropayError {
    #[msg("Insufficient funds to cover amount")]
    InsufficientFunds,
    #[msg("Payment already finalized")]
    AlreadyFinalized,
    #[msg("Only payer can refund")]
    UnauthorizedRefund,
    #[msg("Invalid payment status for this operation")]
    InvalidStatus,
}
