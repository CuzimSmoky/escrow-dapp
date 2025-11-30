use anchor_lang::prelude::*;
use crate::state::{Vault};
use crate::errors::*;

pub fn close(context: Context<CloseVault>) -> Result<()>{
    let vault_status = *&context.accounts.vault.status;
    if vault_status == 1 {
        Ok(())
    } else {
        return Err(MicropayError::InvalidClose.into());
    }
}

#[derive(Accounts)]
pub struct CloseVault<'info>{
        #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"payment",
            vault.payment_id.to_le_bytes().as_ref()
        ],
        bump,
        close = payer,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>
}