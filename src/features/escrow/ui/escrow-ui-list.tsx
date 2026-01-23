import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSolana } from '@/components/solana/use-solana'
import { getEscrowAccounts, usePayoutEscrowMutation } from '@/components/escrow/escrow-data-access'
import { useCloseEscrowMutation } from '@/components/escrow/useCloseEscrowMutation'
import { ESCROW_PROGRAM_ADDRESS } from '../../../../anchor/src/client/js/generated/programs/escrow';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js'
import { Address } from 'gill'
import { useWalletUiSigner } from '@wallet-ui/react'

export function EscrowUiList() {
	const { client, account } = useSolana();
	const programId = ESCROW_PROGRAM_ADDRESS as Address;
	const [escrows, setEscrows] = useState<Array<{ address: Address; data: any }>>([]);
	const [loading, setLoading] = useState(false);
	const [withdrawing, setWithdrawing] = useState<string | null>(null);
	const signer = account ? useWalletUiSigner({ account }) : undefined;
	const payoutMutation = signer ? usePayoutEscrowMutation({ signer, client }) : undefined;
	const closeMutation = signer ? useCloseEscrowMutation({ signer, client }) : undefined;
	const [closing, setClosing] = useState<string | null>(null);

	const refresh = async () => {
		if (!client) return;
		setLoading(true);
		try {
			const accounts = await getEscrowAccounts(client, programId);
			setEscrows(accounts);
		} catch (e) {
			// Optionally handle error
		}
		setLoading(false);
	};

	const handleWithdraw = async (escrow: any, parsed: any) => {
		if (!signer || !client || !payoutMutation) return;
		const isPayer = account && parsed.payer === account.address;
		if (!isPayer) {
			toast.error('Only the payer can withdraw from this escrow.');
			return;
		}
		setWithdrawing(parsed.paymentId);
		try {
			await payoutMutation.mutateAsync({
				recipientAddress: parsed.recipient,
				paymentId: BigInt(parsed.paymentId),
			});
			await refresh();
		} catch (e) {
			// Optionally handle error
		}
		setWithdrawing(null);
	};

	return (
		<section className="escrows-section max-w-4xl mx-auto py-8">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Escrow Accounts</h2>
				<Button
					onClick={refresh}
					variant="outline"
					size="sm"
					disabled={loading}
					className="shadow-sm rounded-lg dark:bg-gray-800 dark:text-gray-100"
				>
					{loading ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>
			<div className="flex grid-cols-1 md:grid-cols-2 gap-6">
				{escrows.map((escrow, idx) => {
					let parsed = escrow.data;
					if (escrow.data instanceof Uint8Array || escrow.data instanceof Buffer) {
						const arr = escrow.data instanceof Buffer ? new Uint8Array(escrow.data) : escrow.data;
						function readBigUInt64LE(offset: number) {
							let value = 0n;
							for (let i = 0; i < 8; i++) {
								value += BigInt(arr[offset + i]) << (8n * BigInt(i));
							}
							return value;
						}
						function pubkeyToBase58(start: number) {
							return new PublicKey(arr.slice(start, start + 32)).toBase58();
						}
						parsed = {
							paymentId: readBigUInt64LE(8).toString(),
							payer: pubkeyToBase58(16),
							amountInLamports: readBigUInt64LE(48).toString(),
							recipient: pubkeyToBase58(56),
							status: arr[88],
						};
					}
					const isPayer = account && parsed.payer === account.address;
					const isWithdrawn = parsed.status === 1 || parsed.status === '1';
					let withdrawDisabled = false;
					let withdrawTooltip = '';
					if (isWithdrawn) {
						withdrawDisabled = true;
						withdrawTooltip = 'Funds have already been withdrawn from this escrow.';
					} else if (isPayer) {
						withdrawDisabled = withdrawing === parsed.paymentId || Boolean(payoutMutation && payoutMutation.isPending);
					} else {
						withdrawDisabled = true;
						withdrawTooltip = 'Only the payer can withdraw from this escrow.';
					}
					// Close button logic (enabled for payer and status 1)
					let closeDisabled = true;
					let closeTooltip = '';
					if (isWithdrawn && isPayer) {
						closeDisabled = closing === parsed.paymentId || Boolean(closeMutation && closeMutation.isPending);
						closeTooltip = 'Close this escrow account.';
					} else if (!isWithdrawn) {
						closeTooltip = 'You can only close after payout.';
					} else if (!isPayer) {
						closeTooltip = 'Only the payer can close this escrow.';
					}
					return (
						<div key={escrow.address.toString()} className="escrow-card bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col justify-between transition hover:shadow-xl border border-gray-100 dark:border-gray-800">
							<div className="mb-4">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">Escrow ID {parsed.paymentId}</h4>
									<span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">Status: {parsed.status}</span>
								</div>
								<div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
									<div><span className="font-medium text-gray-700 dark:text-gray-200">Payment ID:</span> {parsed.paymentId}</div>
									<div><span className="font-medium text-gray-700 dark:text-gray-200">Address:</span> <span className="break-all">{escrow.address.toString()}</span></div>
									<div><span className="font-medium text-gray-700 dark:text-gray-200">Amount:</span> {parsed.amountInLamports} Lamports</div>
									<div><span className="font-medium text-gray-700 dark:text-gray-200">Payer:</span> <span className="break-all">{parsed.payer}</span></div>
									<div><span className="font-medium text-gray-700 dark:text-gray-200">Recipient:</span> <span className="break-all">{parsed.recipient}</span></div>
								</div>
							</div>
							<div className="flex gap-2 mt-2">
								<span title={withdrawTooltip} className="flex-1">
									<Button
										variant="default"
										size="sm"
										disabled={withdrawDisabled}
										onClick={() => handleWithdraw(escrow, parsed)}
										className="w-full rounded-lg dark:bg-gray-800 dark:text-gray-100"
									>
										{isWithdrawn ? 'Withdrawn' : (withdrawing === parsed.paymentId ? 'Withdrawing...' : 'Withdraw')}
									</Button>
								</span>
								<span title={closeTooltip} className="flex-1">
									<Button
										variant="default"
										size="sm"
										disabled={closeDisabled}
										className="w-full rounded-lg dark:bg-gray-800 dark:text-gray-100"
										onClick={async () => {
											if (!signer || !client || !closeMutation) return;
											const isPayer = account && parsed.payer === account.address;
											if (!isPayer) {
												toast.error('Only the payer can close this escrow.');
												return;
											}
											setClosing(parsed.paymentId);
											try {
												await closeMutation.mutateAsync({ paymentId: BigInt(parsed.paymentId) });
												await refresh();
											} catch (e) {
												// Optionally handle error
											}
											setClosing(null);
										}}
									>
										{closing === parsed.paymentId ? 'Closing...' : 'Close'}
									</Button>
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
