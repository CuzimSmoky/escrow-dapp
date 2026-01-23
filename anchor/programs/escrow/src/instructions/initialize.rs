use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction,
    program::invoke,
    rent::Rent,
    sysvar::Sysvar,
};

use crate::state::Vault;
use crate::errors::*;

pub fn initialize(
    ctx: Context<InitializeVault>,
    amount_in_lamports: u64,
    payment_id: u64,
) -> Result<()> {
    
    require!(amount_in_lamports > 0, MicropayError::InsufficientFunds);

    let payer = &ctx.accounts.payer;
    let token_vault = &ctx.accounts.token_vault;
    let system_program = &ctx.accounts.system_program;

    if token_vault.lamports() == 0 {
        let rent = Rent::get()?;
        let lamports_required = rent.minimum_balance(0);

        let create_ix = system_instruction::create_account(
            &payer.key(),
            &token_vault.key(),
            lamports_required,
            0, // keine Daten, nur Lamports
            &system_program.key(),
        );

        let payment_id_bytes = payment_id.to_le_bytes();
        let bump = ctx.bumps.token_vault;
        let signer_seeds: &[&[u8]] = &[b"tokenvault", &payment_id_bytes, &[bump]];
        let signer_seeds_slice: &[&[&[u8]]] = &[signer_seeds];

        anchor_lang::solana_program::program::invoke_signed(
            &create_ix,
            &[
                payer.to_account_info(),
                token_vault.to_account_info(),
                system_program.to_account_info(),
            ],
            signer_seeds_slice,
        )?;
    }

    let transfer_ix = system_instruction::transfer(
        &payer.key(),
        &token_vault.key(),
        amount_in_lamports,
    );

    invoke(
        &transfer_ix,
        &[
            payer.to_account_info(),
            token_vault.to_account_info(),
            system_program.to_account_info(),
        ],
    )?;

    let vault = &mut ctx.accounts.vault;
    vault.payer = payer.key();
    vault.recipient = ctx.accounts.recipient.key();
    vault.amount_in_lamports = amount_in_lamports;
    vault.payment_id = payment_id;
    vault.bump = ctx.bumps.vault;
    vault.token_vault_bump = ctx.bumps.token_vault;

    Ok(())
}

#[derive(Accounts)]
#[instruction(amount_in_lamports: u64, payment_id: u64)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub recipient: SystemAccount<'info>,

    #[account(
        init,
        seeds = [b"payment", payment_id.to_le_bytes().as_ref()],
        bump,
        payer = payer,
        space = 8 + Vault::INIT_SPACE,
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut, seeds = [b"tokenvault", payment_id.to_le_bytes().as_ref()], bump)]
    pub token_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}
