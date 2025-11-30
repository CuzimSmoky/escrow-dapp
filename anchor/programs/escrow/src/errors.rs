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
    #[msg("This user is not authorized to use this instruction")]
    Unauthorized,
    #[msg("Invalid recipient provided")]
    InvalidRecipient,
    #[msg("Closing of the account has been refused: Balance has not been paid out yet")]
    InvalidClose,
}
