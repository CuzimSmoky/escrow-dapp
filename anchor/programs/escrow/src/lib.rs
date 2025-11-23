#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;
pub mod errors;

pub use instructions::*;
declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

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
}
