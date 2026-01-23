import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { EscrowUiProgramExplorerLink } from './ui/escrow-ui-program-explorer-link'
import { EscrowUiCreate } from './ui/escrow-ui-create'
import { EscrowUiProgram } from '@/features/escrow/ui/escrow-ui-program'

export default function EscrowFeature() {
  const { account } = useSolana()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="Escrow" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <EscrowUiProgramExplorerLink />
        </p>
        <EscrowUiCreate account={account} />
      </AppHero>
      <EscrowUiProgram />
    </div>
  )
}
