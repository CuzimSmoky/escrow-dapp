import { ESCROW_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function EscrowUiProgramExplorerLink() {
  return <AppExplorerLink address={ESCROW_PROGRAM_ADDRESS} label={ellipsify(ESCROW_PROGRAM_ADDRESS)} />
}
