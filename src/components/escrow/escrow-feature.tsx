import { WalletButton } from '../solana/solana-provider'
import { EscrowProgram, EscrowProgramExplorerLink, EscrowList } from './escrow-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function EscrowFeature() {
	const { account } = useWalletUi()

	if (!account) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="hero py-[64px]">
					<div className="hero-content text-center">
						<WalletButton />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			<AppHero title="Escrow Manager" subtitle={'Start by clicking "Create Escrow" or manage previous created escrows'}>
			</AppHero>
			<EscrowProgram />
			<EscrowList />
		</div>
	)
}
