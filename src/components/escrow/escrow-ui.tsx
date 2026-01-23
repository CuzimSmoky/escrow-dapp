import './escrow-component-styles.css'
import { ellipsify, useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { AppModal } from '../app-modal'
import { Input } from '../ui/input'
import { useState } from 'react'
import { Label } from '@radix-ui/react-label'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import {
	getEscrowAccounts,
	ESCROW_PROGRAM_ADDRESS,
	getInitializeInstructionAsync
} from './escrow-data-access'
import { Address } from 'gill'
import { PublicKey } from '@solana/web3.js'

export function EscrowProgramExplorerLink() {
  const programId = ESCROW_PROGRAM_ADDRESS
  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

function Payout({ escrowAddress }: { escrowAddress: Address }) {
  const signer = useWalletUiSigner()
  const client = useWalletUi().client
  // TODO: Implement payout logic
  const payout = async () => {
    // Implement payout logic here
    alert('Payout not implemented')
  }
  return (
    <Button onClick={payout} variant="outline" size="sm">Payout</Button>
  )
}

function CloseEscrow({ escrowAddress }: { escrowAddress: Address }) {
  const signer = useWalletUiSigner()
  const client = useWalletUi().client
  // TODO: Implement close logic
  const close = async () => {
    // Implement close logic here
    alert('Close not implemented')
  }
  return (
    <Button onClick={close} variant="outline" size="sm">Close Escrow</Button>
  )
}

// Placeholder for escrow list
import { useEffect, useState } from 'react'
// ...existing code...
import { useWalletUi } from '@wallet-ui/react'
import { Address } from 'gill'

export function EscrowList() {
	const client = useWalletUi().client
	const programId = ESCROW_PROGRAM_ADDRESS as Address
	const [escrows, setEscrows] = useState<Array<{address: Address, data: any}>>([])
	const [loading, setLoading] = useState(false)

	const refresh = async () => {
		if (!client) return
		setLoading(true)
		try {
			const accounts = await getEscrowAccounts(client, programId)
			setEscrows(accounts)
		} catch (e) {
			// Optionally handle error
		}
		setLoading(false)
	}

	return (
		<div className="escrows-section">
			<div>
				<h3>Escrows</h3>
				<Button
					onClick={refresh}
					variant="outline"
					size="sm"
					disabled={loading}
				>
					{loading ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>
			<div>
				{escrows.map((escrow, idx) => (
					<div key={escrow.address.toString()}>
						<h4>Escrow {idx + 1}</h4>
						<p>Address: {escrow.address.toString()}</p>
						{/* Render escrow fields here, update as needed */}
						<pre>{JSON.stringify(escrow.data, null, 2)}</pre>
						<div>
							<Payout escrowAddress={escrow.address} />
							<CloseEscrow escrowAddress={escrow.address} />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

// Placeholder for create escrow modal
export function CreateEscrow() {
	const signer = useWalletUiSigner()
	const client = useWalletUi().client
	const [formData, setFormData] = useState({
		recipient: '',
		amount: '',
		paymentId: ''
	})

	const handleSubmit = async () => {
		if (!signer || !client) return
		const ix = await getInitializeInstructionAsync({
			payer: signer,
			recipient: formData.recipient as Address,
			vault: PublicKey.default,
			tokenVault: PublicKey.default,
			amountInLamports: BigInt(formData.amount),
			paymentId: BigInt(formData.paymentId)
		})
		// TODO: Replace vault/tokenVault with correct PDAs
		// TODO: Use processTransaction if available
		alert('Transaction not fully implemented')
		setFormData({ recipient: '', amount: '', paymentId: '' })
	}

	return (
		<AppModal
			title="Create Escrow"
			submit={handleSubmit}
			submitLabel="Create"
		>
			<div className="create-escrow-modal">
				<div>
					<Label htmlFor="recipient">Recipient</Label>
					<Input
						id='recipient'
						value={formData.recipient}
						onChange={(e) => setFormData(prev => ({...prev, recipient: e.target.value}))}
					/>
				</div>
				<div>
					<Label htmlFor="amount">Amount (lamports)</Label>
					<Input
						id='amount'
						type="number"
						min="1"
						value={formData.amount}
						onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
					/>
				</div>
				<div>
					<Label htmlFor="paymentId">Payment ID</Label>
					<Input
						id='paymentId'
						type="number"
						min="1"
						value={formData.paymentId}
						onChange={(e) => setFormData(prev => ({...prev, paymentId: e.target.value}))}
					/>
				</div>
			</div>
		</AppModal>
	)
}

export function EscrowProgram() {
	return (
		<div className="escrow-registry">
			<div>
				<h2>Escrow Registry</h2>
				<EscrowProgramExplorerLink />
				<CreateEscrow />
			</div>
			<br />
			<EscrowList />
		</div>
	)
}
