import './escrow-component-styles.css'
import { ellipsify, useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
// import { useEscrowProgramId, processTransaction, getEscrowAccounts } from './escrow-data-access' // To be implemented
import { AppModal } from '../app-modal'
import { Input } from '../ui/input'
import { useState } from 'react'
import { Label } from '@radix-ui/react-label'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
// import { Escrow, getPayoutInstructionAsync, getInitializeInstructionAsync, getCloseInstruction } from '@project/anchor' // To be implemented
// import { Address } from 'gill' // To be implemented

// Placeholder for program explorer link
export function EscrowProgramExplorerLink() {
	// const programId = useEscrowProgramId()
	// return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
	return <span>Escrow Program Explorer Link (to be implemented)</span>
}

// Placeholder for payout action
function Payout({ escrowAddress }: { escrowAddress: any }) {
	// const signer = useWalletUiSigner()
	// const client = useWalletUi().client
	// const payout = async () => { ... }
	return (
		<Button
			// onClick={payout}
			variant="outline"
			size="sm"
			disabled
		>
			Payout (to be implemented)
		</Button>
	)
}

// Placeholder for close action
function CloseEscrow({ escrowAddress }: { escrowAddress: any }) {
	// const signer = useWalletUiSigner()
	// const client = useWalletUi().client
	// const close = async () => { ... }
	return (
		<Button
			// onClick={close}
			variant="outline"
			size="sm"
			disabled
		>
			Close Escrow (to be implemented)
		</Button>
	)
}

// Placeholder for escrow list
function EscrowList() {
	// const client = useWalletUi().client
	// const programId = useEscrowProgramId()
	// const [escrows, setEscrows] = useState<Array<{address: Address, data: Escrow}>>([])
	// const refresh = async () => { ... }
	return (
		<div className="escrows-section">
			<div>
				<h3>Escrows</h3>
				<Button
					// onClick={refresh}
					variant="outline"
					size="sm"
					disabled
				>
					Refresh (to be implemented)
				</Button>
			</div>
			<div>
				{/* Map escrows here */}
				<div>
					<h4>Sample Escrow</h4>
					<p>Description of the escrow goes here.</p>
					<div>
						<span>Amount (lamports): 0</span><br />
						<span>Status: Pending</span><br />
						<span>Created: --</span><br />
					</div>
					<div>
						<Payout escrowAddress={null} />
						<CloseEscrow escrowAddress={null} />
					</div>
				</div>
			</div>
		</div>
	)
}

// Placeholder for create escrow modal
export function CreateEscrow() {
	// const signer = useWalletUiSigner()
	// const client = useWalletUi().client
	const [formData, setFormData] = useState({
		description: '',
		amount: '',
	})
	// const handleSubmit = async () => { ... }
	return (
		<AppModal
			title="Create Escrow"
			// submit={handleSubmit}
			submitLabel="Create (to be implemented)"
			disabled
		>
			<div className="create-escrow-modal">
				<div>
					<Label htmlFor="description">Escrow description</Label>
					<Input
						id='description'
						value={formData.description}
						onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
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
			</div>
		</AppModal>
	)
}

export function EscrowProgram() {
	return (
		<div className="escrow-registry">
			<div>
				<h2>Escrow Registry</h2>
				<CreateEscrow />
			</div>

			<br />

			<EscrowList />
		</div>
	)
}
