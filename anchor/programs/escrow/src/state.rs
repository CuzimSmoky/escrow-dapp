use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub payment_id: u64,     // 8
    pub payer: Pubkey,       // 32
    pub recipient: Pubkey,   // 32
    pub amount_in_lamports: u64,         // 8
    pub status: u8,          // 1  (enum as u8)
    pub bump: u8,            // 1
}
