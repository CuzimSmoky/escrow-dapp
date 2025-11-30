import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Escrow } from '../target/types/escrow';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { startAnchor } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';

const IDL = require('../target/idl/escrow.json');
const PROGRAM_ID = new PublicKey('9XFM9Jc7NzDqoqma8BmtdFvRHmhsfLSQ5LRfP6JXvA3x');

describe('Escrow', () => {

  let context: any;
  let provider: any;
  let escrowProgram: Program<Escrow>;
  let vaultPda: PublicKey;
  let tokenVaultPda: PublicKey;
  let vaultAccount: any;
  let tokenVaultAccount: any;
  const paymentId = new anchor.BN(1);

  beforeAll(async () => {
    // Initializing Bankrun
    context = await startAnchor('', [{ name: 'escrow', programId: PROGRAM_ID }], []);
    provider = new BankrunProvider(context);
    escrowProgram = new Program<Escrow>(IDL, provider);

    // Calculating Vault PDAs
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment"), paymentId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    [tokenVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('tokenvault'), paymentId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );
  });

  it('Initialize Vault', async () => {
    const payer = context.payer;
    const recipient = Keypair.generate();

    // Initialize RPC
    const tx = await escrowProgram.methods
      .initialize(
        new anchor.BN(1000000000),
        paymentId
      )
      .accounts({
        payer: payer.publicKey,
        recipient: recipient.publicKey,
        vault: vaultPda,
        tokenVault: tokenVaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Init signature:', tx);

    // Logging Vault account
    vaultAccount = await escrowProgram.account.vault.fetch(vaultPda);
    console.log('Initialized vault:', vaultAccount);
    const balance = await context.banksClient.getBalance(recipient.publicKey);
    console.log("Balance:", balance);
  });

  it('Payout Vault', async () => {
    const payer = context.payer;

    // Getting the recipient saved in the vaultAccount
    const recipient = new PublicKey(vaultAccount.recipient);

    const tx = await escrowProgram.methods
      .payout()
      .accounts({
        payer: payer.publicKey,
        recipient: recipient,
        vault: vaultPda,
        tokenVault: tokenVaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Payout signature:', tx);

    // Logging the vault to check if the balance updated 
    const updatedVault = await escrowProgram.account.vault.fetch(vaultPda);
    console.log('After payout:', updatedVault);
    const balance = await context.banksClient.getBalance(recipient);
    console.log("Balance:", balance);
  });

  it('Close Vault', async () => {
    const payer = context.payer;

    const balanceBefore = await context.banksClient.getBalance(payer.publicKey);
    console.log("Balance before:", balanceBefore);

    const tx = await escrowProgram.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('close signature:', tx);

    // Logging the vault to check if the balance updated 
    const balanceAfter = await context.banksClient.getBalance(payer.publicKey);
    console.log("Balance after:", balanceAfter);
  });

});
