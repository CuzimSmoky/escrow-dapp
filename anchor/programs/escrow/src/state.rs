use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub payment_id: u64,    
    pub payer: Pubkey,
    pub amount_in_lamports: u64,     
    pub recipient: Pubkey,   
    pub status: u8,          
    pub bump: u8,     
    pub token_vault_bump: u8,       
}

