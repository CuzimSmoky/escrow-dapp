use anchor_lang::solana_program;
use anchor_lang::solana_program::program_error::INVALID_SEEDS;
use anchor_lang::{prelude::*, solana_program::native_token::sol_to_lamports};
use crate::state::Vault;
use crate::errors::*;

pub fn payout(context: Context<PayoutVault>, ) ->Result<()> {

    let payer = &context.accounts.payer;
    let vault = &mut context.accounts.vault;
    let recipient = &context.accounts.recipient;
    let amount_in_lamports = vault.amount_in_lamports;
    let payment_id = &vault.payment_id;
    let bump = vault.bump;

    require_keys_eq!(payer.key(), vault.payer, MicropayError::Unauthorized);

    let payment_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &vault.key(), 
        &recipient.key(), 
        amount_in_lamports
    );

    anchor_lang::solana_program::program::invoke_signed(
        &payment_instruction, 
        &[vault.to_account_info(), recipient.to_account_info()], 
        &[&[b"payment", payment_id.to_le_bytes().as_ref(), &[bump]]]
    )?;

    Ok(())
}



#[derive(Accounts)]
pub struct PayoutVault<'info> {

    #[account(mut)]
    pub payer: Signer<'info>,

    // Funds are transferred to this recipient
    #[account(mut)]
    pub recipient: SystemAccount<'info>,

    // The existing vault PDA
    #[account(
        mut,
        seeds = [
            b"payment",
            vault.payment_id.to_le_bytes().as_ref()
        ],
        bump = vault.bump,
        has_one = recipient @ MicropayError::InvalidRecipient,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
