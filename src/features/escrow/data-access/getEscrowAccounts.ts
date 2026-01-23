import { Address, SolanaClient } from 'gill'
import { ESCROW_PROGRAM_ADDRESS } from '@project/anchor'
import { PublicKey } from '@solana/web3.js'

// Discriminator for the escrow account (from anchor/target/types/escrow.ts)
const ESCROW_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119])

// TODO: Replace with actual decoder for escrow account
function getEscrowDecoder() {
  // Implement or import the actual decoder for escrow account data
  return {
    decode: (buf: Buffer) => buf // placeholder
  }
}

export async function getEscrowAccounts(client: SolanaClient, programId: Address) {
  const allAccounts = await client.rpc.getProgramAccounts(programId, {
    encoding: 'base64'
  }).send()

  const filteredAccounts = allAccounts.filter((account: any) => {
    const data = Buffer.from(account.account.data[0], 'base64')
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(ESCROW_DISCRIMINATOR)
  })

  const decoder = getEscrowDecoder()
  const decodedAccounts = filteredAccounts.map((account: any) => ({
    address: account.pubkey,
    data: decoder.decode(Buffer.from(account.account.data[0], 'base64'))
  }))

  return decodedAccounts
}
