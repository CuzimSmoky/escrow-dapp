import { useMutation } from '@tanstack/react-query';
import { getCloseInstruction } from '../../../anchor/src/client/js/generated/instructions/close';
import { ESCROW_PROGRAM_ADDRESS } from '../../../anchor/src/client/js/generated/programs/escrow';
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder } from 'gill';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { toastTx } from '@/components/toast-tx';
import { Address, SolanaClient, TransactionSigner } from 'gill';

export async function processCloseEscrowTransaction(
  signer: TransactionSigner,
  client: SolanaClient,
  params: { paymentId: bigint }
) {
  const paymentIdBN = params.paymentId;
  const vaultSeed = Buffer.from('payment');
  // Convert bigint to Buffer (little-endian, 8 bytes)
  const paymentIdBuf = Buffer.alloc(8);
  let temp = paymentIdBN;
  for (let i = 0; i < 8; i++) {
    paymentIdBuf[i] = Number(temp & 0xffn);
    temp >>= 8n;
  }
  const [vaultPda] = await PublicKey.findProgramAddress([
    vaultSeed,
    paymentIdBuf
  ], new PublicKey(ESCROW_PROGRAM_ADDRESS));
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
  const instruction = getCloseInstruction({
    payer: signer,
    vault: vaultPda,
    // systemProgram is optional, will default
  });
  const transaction = createTransaction({
    feePayer: signer,
    version: 0,
    latestBlockhash,
    instructions: [instruction],
  });
  const signature = await signAndSendTransactionMessageWithSigners(transaction, [signer]);
  const decoder = getBase58Decoder();
  const sig58 = decoder.decode(signature);
  return sig58;
}

export function useCloseEscrowMutation({ signer, client }: { signer: TransactionSigner, client: SolanaClient }) {
  return useMutation({
    mutationFn: async (params: { paymentId: bigint }) => {
      try {
        const sig = await processCloseEscrowTransaction(signer, client, params);
        return sig;
      } catch (error) {
        console.error('Close transaction error:', error);
        throw error;
      }
    },
    onSuccess: (signature) => {
      if (typeof signature === 'string' && signature.length > 0) {
        toastTx(signature);
      } else {
        toast('Escrow closed, but no signature returned', { description: 'Check explorer for details.' });
      }
    },
    onError: (error) => {
      toast.error('Failed to close escrow');
      console.error('Failed to close escrow:', error);
    },
  });
}
