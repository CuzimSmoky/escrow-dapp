
import { ESCROW_PROGRAM_ADDRESS, getInitializeInstructionAsync } from '@project/anchor'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } from 'gill'
import { Address, SolanaClient, TransactionSigner } from 'gill'


// Standalone function for processing escrow transaction, like ticketregistry
export async function processEscrowTransaction(
  signer: TransactionSigner,
  client: SolanaClient,
  params: {
    recipientAddress: string
    amountInLamports: bigint
    paymentId: bigint
  }
) {
  const recipient = params.recipientAddress as Address
  const paymentIdBN = new BN(params.paymentId.toString())
  const vaultSeed = Buffer.from('payment')
  const tokenVaultSeed = Buffer.from('tokenvault')
  const paymentIdBuf = Buffer.alloc(8)
  paymentIdBN.toArrayLike(Buffer, 'le', 8).copy(paymentIdBuf)
  const [vaultPda] = await PublicKey.findProgramAddress([
    vaultSeed,
    paymentIdBuf
  ], new PublicKey(ESCROW_PROGRAM_ADDRESS))
  const [tokenVaultPda] = await PublicKey.findProgramAddress([
    tokenVaultSeed,
    paymentIdBuf
  ], new PublicKey(ESCROW_PROGRAM_ADDRESS))
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const instruction = await getInitializeInstructionAsync({
    payer: signer,
    recipient,
    vault: vaultPda,
    tokenVault: tokenVaultPda,
    amountInLamports: params.amountInLamports,
    paymentId: params.paymentId,
  })
  const transaction = createTransaction({
    feePayer: signer,
    version: 0,
    latestBlockhash,
    instructions: [instruction],
  })
  const signature = await signAndSendTransactionMessageWithSigners(transaction, [signer])
  const decoder = getBase58Decoder()
  const sig58 = decoder.decode(signature)
  return sig58
}

// React hook mutation using the standalone function
export function useInitializeEscrowMutation({ signer, client }: { signer: TransactionSigner, client: SolanaClient }) {
  return useMutation({
    mutationFn: async (params: {
      recipientAddress: string
      amountInLamports: bigint
      paymentId: bigint
    }) => {
      try {
        const sig = await processEscrowTransaction(signer, client, params)
        return sig
      } catch (error) {
        console.error('Escrow transaction error:', error)
        throw error
      }
    },
    onSuccess: (signature) => {
      if (typeof signature === 'string' && signature.length > 0) {
        toastTx(signature)
      } else {
        toast('Escrow initialized, but no signature returned', { description: 'Check explorer for details.' })
      }
    },
    onError: (error) => {
      toast.error('Failed to initialize escrow')
      console.error('Failed to initialize escrow:', error)
    },
  })
}
