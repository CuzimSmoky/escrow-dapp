import { AppAlert } from '@/components/app-alert'
import { useSolana } from '@/components/solana/use-solana'
import { EscrowUiList } from './escrow-ui-list'

export function EscrowUiProgram() {
  const { cluster } = useSolana()
  // Optionally keep the program account query for error handling
  // const query = useGetProgramAccountQuery()

  // if (query.isLoading) {
  //   return <span className="loading loading-spinner loading-lg"></span>
  // }
  // if (!query.data?.value) {
  //   return (
  //     <AppAlert>Program account not found on {cluster.label}. Be sure to deploy your program and try again.</AppAlert>
  //   )
  // }
  return (
    <div className={'space-y-6'}>
      <EscrowUiList />
    </div>
  )
}
