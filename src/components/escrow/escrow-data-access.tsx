import { getPayoutInstruction } from '@project/anchor';
import { ESCROW_PROGRAM_ADDRESS } from '../../../anchor/src/client/js/generated/programs/escrow';
// Payout (withdraw) transaction for recipient
export async function processPayoutTransaction(
	signer: TransactionSigner,
	client: SolanaClient,
	params: {
		recipientAddress: string;
		paymentId: bigint;
	}
) {
	const recipient = params.recipientAddress as Address;
	const paymentIdBN = new BN(params.paymentId.toString());
	const vaultSeed = Buffer.from('payment');
	const tokenVaultSeed = Buffer.from('tokenvault');
	const paymentIdBuf = Buffer.alloc(8);
	paymentIdBN.toArrayLike(Buffer, 'le', 8).copy(paymentIdBuf);
	const [vaultPda] = await PublicKey.findProgramAddress([
		vaultSeed,
		paymentIdBuf
	], new PublicKey(ESCROW_PROGRAM_ADDRESS));
	const [tokenVaultPda] = await PublicKey.findProgramAddress([
		tokenVaultSeed,
		paymentIdBuf
	], new PublicKey(ESCROW_PROGRAM_ADDRESS));
	const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
	const instruction = getPayoutInstruction({
		payer: signer,
		recipient,
		vault: vaultPda,
		tokenVault: tokenVaultPda,
		systemProgram: new PublicKey('11111111111111111111111111111111'),
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

// React hook for payout (withdraw)
export function usePayoutEscrowMutation({ signer, client }: { signer: TransactionSigner, client: SolanaClient }) {
	return useMutation({
		mutationFn: async (params: {
			recipientAddress: string;
			paymentId: bigint;
		}) => {
			try {
				const sig = await processPayoutTransaction(signer, client, params);
				return sig;
			} catch (error) {
				console.error('Payout transaction error:', error);
				throw error;
			}
		},
		onSuccess: (signature) => {
			if (typeof signature === 'string' && signature.length > 0) {
				toastTx(signature);
			} else {
				toast('Payout complete, but no signature returned', { description: 'Check explorer for details.' });
			}
		},
		onError: (error) => {
			toast.error('Failed to withdraw from escrow');
			console.error('Failed to withdraw from escrow:', error);
		},
	});
}

import { Address, SolanaClient, TransactionSigner } from 'gill';
import { getInitializeInstructionAsync } from '@project/anchor';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toastTx } from '@/components/toast-tx';
import { createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } from 'gill';
import { useSolana } from '@/components/solana/use-solana';

// Discriminator for the escrow account (from anchor/target/types/escrow.ts)
const ESCROW_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119]);

// TODO: Replace with actual decoder for escrow account
function getEscrowDecoder() {
	return {
		decode: (buf: Buffer) => buf // placeholder
	};
}

export async function getEscrowAccounts(client: SolanaClient, programId: Address) {
	const allAccounts = await client.rpc.getProgramAccounts(programId, {
		encoding: 'base64'
	}).send();

	const filteredAccounts = allAccounts.filter((account: any) => {
		const data = Buffer.from(account.account.data[0], 'base64');
		const discriminator = data.subarray(0, 8);
		return discriminator.equals(ESCROW_DISCRIMINATOR);
	});

	const decoder = getEscrowDecoder();
	const decodedAccounts = filteredAccounts.map((account: any) => ({
		address: account.pubkey,
		data: decoder.decode(Buffer.from(account.account.data[0], 'base64'))
	}));

	return decodedAccounts;
}

export async function processEscrowTransaction(
	signer: TransactionSigner,
	client: SolanaClient,
	params: {
		recipientAddress: string;
		amountInLamports: bigint;
		paymentId: bigint;
	}
) {
	const recipient = params.recipientAddress as Address;
	const paymentIdBN = new BN(params.paymentId.toString());
	const vaultSeed = Buffer.from('payment');
	const tokenVaultSeed = Buffer.from('tokenvault');
	const paymentIdBuf = Buffer.alloc(8);
	paymentIdBN.toArrayLike(Buffer, 'le', 8).copy(paymentIdBuf);
	const [vaultPda] = await PublicKey.findProgramAddress([
		vaultSeed,
		paymentIdBuf
	], new PublicKey(ESCROW_PROGRAM_ADDRESS));
	const [tokenVaultPda] = await PublicKey.findProgramAddress([
		tokenVaultSeed,
		paymentIdBuf
	], new PublicKey(ESCROW_PROGRAM_ADDRESS));
	const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
	const instruction = await getInitializeInstructionAsync({
		payer: signer,
		recipient,
		vault: vaultPda,
		tokenVault: tokenVaultPda,
		amountInLamports: params.amountInLamports,
		paymentId: params.paymentId,
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

export function useInitializeEscrowMutation({ signer, client }: { signer: TransactionSigner, client: SolanaClient }) {
	return useMutation({
		mutationFn: async (params: {
			recipientAddress: string;
			amountInLamports: bigint;
			paymentId: bigint;
		}) => {
			try {
				const sig = await processEscrowTransaction(signer, client, params);
				return sig;
			} catch (error) {
				console.error('Escrow transaction error:', error);
				throw error;
			}
		},
		onSuccess: (signature) => {
			if (typeof signature === 'string' && signature.length > 0) {
				toastTx(signature);
			} else {
				toast('Escrow initialized, but no signature returned', { description: 'Check explorer for details.' });
			}
		},
		onError: (error) => {
			toast.error('Failed to initialize escrow');
			console.error('Failed to initialize escrow:', error);
		},
	});
}

export function useGetProgramAccountQuery() {
	const { client, cluster } = useSolana();
	return useQuery({
		queryKey: ['get-program-account', { cluster }],
		queryFn: () => client.rpc.getAccountInfo(ESCROW_PROGRAM_ADDRESS).send(),
	});
}

export function useGreetMutation({ account }: { account: any }) {
	// You may need to adjust types for UiWalletAccount
	// and useWalletUiSigner/useWalletUiSignAndSend imports
	return useMutation({
		mutationFn: async () => {
			// Implement signAndSend logic as needed
			return getGreetInstruction({ programAddress: ESCROW_PROGRAM_ADDRESS });
		},
		onSuccess: (signature) => {
			toastTx(signature);
		},
		onError: () => toast.error('Failed to run program'),
	});
}
