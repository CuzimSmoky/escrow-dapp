use anchor_lang::{prelude::*, solana_program::native_token::sol_to_lamports};
use crate::state::Vault;
use crate::errors::*;

pub fn initialize(context: Context<InitializeVault>, amount_in_lamports: u64, payment_id: u64) -> Result<()> {

    // Check that amount is greater than zero
    require!(amount_in_lamports > 0, MicropayError::InsufficientFunds);
    
    // Creating local variables from the context
    let payer = &context.accounts.payer;

    // Initializing the PaymentAccount
    let vault = &mut context.accounts.vault;
    vault.payer = payer.key();
    vault.recipient = context.accounts.recipient.key();
    vault.amount_in_lamports = amount_in_lamports;
    vault.payment_id = payment_id;
    vault.bump = context.bumps.vault;
    

    // Creating instruction which is used for the cross program invocation
    let payment_instruction = anchor_lang::solana_program::system_instruction::transfer(&payer.key, &vault.key(), amount_in_lamports);

    anchor_lang::solana_program::program::invoke(&payment_instruction, &[payer.to_account_info(), vault.to_account_info()])?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(amount_in_lamports: u64,  payment_id: u64)]
pub struct InitializeVault<'info> {

    #[account(mut)]
    pub payer: Signer<'info>,

    pub recipient: SystemAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + Vault::INIT_SPACE, 
        seeds = [b"payment",                        // Using a byte array of string "payment" to avoid seed collision
        payment_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
