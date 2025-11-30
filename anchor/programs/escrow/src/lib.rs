#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;
pub mod errors;

pub use instructions::*;
declare_id!("9XFM9Jc7NzDqoqma8BmtdFvRHmhsfLSQ5LRfP6JXvA3x");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(
        context: Context<InitializeVault>,
        amount_in_lamports: u64,
        payment_id: u64,
    ) -> Result<()> {
        instructions::initialize::initialize(context, amount_in_lamports, payment_id)
    }

    pub fn payout(
        context: Context<PayoutVault>,
    ) -> Result<()> {
        instructions::payout::payout(context)
    }
        pub fn close(
        context: Context<CloseVault>,
    ) -> Result<()> {
        instructions::close::close(context)
    }
}
