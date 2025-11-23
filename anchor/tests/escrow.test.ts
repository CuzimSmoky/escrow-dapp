import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Escrow } from '../target/types/escrow'
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js'
import assert from 'assert'
import BN from 'bn.js'

describe('escrow', () => {
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.escrow as Program<Escrow>
  const payer = anchor.web3.Keypair.generate()
  const recipient = anchor.web3.Keypair.generate()
  const unauthorizedUser = anchor.web3.Keypair.generate()

  it('Airdrop SOL to all test accounts', async () => {
    await airdrop(program.provider.connection, payer.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, recipient.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, unauthorizedUser.publicKey, 5 * LAMPORTS_PER_SOL)
  })

  describe('Initialize Vault', () => {
    it('Should initialize vault successfully', async () => {
      const paymentId = new BN(1)
      const amount = new BN(0.5 * LAMPORTS_PER_SOL)

      await initializeVault(program, payer, recipient.publicKey, amount, paymentId)

      const vaultPda = getVaultPda(program, paymentId)[0]
      const vaultAccount = await program.account.vault.fetch(vaultPda)

      assert.equal(vaultAccount.paymentId.toString(), paymentId.toString())
      assert.equal(vaultAccount.payer.toString(), payer.publicKey.toString())
      assert.equal(vaultAccount.recipient.toString(), recipient.publicKey.toString())
      assert.equal(vaultAccount.amountInLamports.toString(), amount.toString())
      assert.equal(vaultAccount.status, 0) // Initial status
    })
  })
})

// HELPERS

async function airdrop(connection: Connection, address: PublicKey, amount: number = 1000 * LAMPORTS_PER_SOL) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), 'confirmed')
}

async function initializeVault(
  program: Program<Escrow>,
  payer: anchor.web3.Keypair,
  recipient: PublicKey,
  amountInLamports: BN,
  paymentId: BN,
) {
  const [vaultPda] = getVaultPda(program, paymentId)

  await program.methods
    .initialize(amountInLamports, paymentId)
    .accounts({
      payer: payer.publicKey,
      recipient,
      vault: vaultPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([payer])
    .rpc()
}

function getVaultPda(program: Program<Escrow>, paymentId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('payment'), Buffer.from(paymentId.toArray('le', 8))],
    program.programId,
  )
}
