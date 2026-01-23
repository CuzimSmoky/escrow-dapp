import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useInitializeEscrowMutation } from '../data-access/use-initialize-escrow-mutation'
import { useState } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { useWalletUiSigner } from '@wallet-ui/react'

export function EscrowUiCreate({ account }: { account: UiWalletAccount }) {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amountInLamports, setAmountInLamports] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const { client } = useSolana()
  const signer = useWalletUiSigner({ account })
  const initMutation = useInitializeEscrowMutation({ signer, client })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientAddress || !amountInLamports || !paymentId) {
      return
    }

    try {
      await initMutation.mutateAsync({
        recipientAddress,
        amountInLamports: BigInt(amountInLamports),
        paymentId: BigInt(paymentId),
      })
      setRecipientAddress('')
      setAmountInLamports('')
      setPaymentId('')
    } catch (error: any) {
      let logs: string[] | undefined = undefined
      if (error && typeof error === 'object' && 'logs' in error) {
        logs = (error as any).logs
      } else if (error && typeof error === 'object' && 'getLogs' in error && typeof error.getLogs === 'function') {
        logs = await error.getLogs()
      }
      if (logs && logs.some((l: string) => l.includes('success'))) {
        setRecipientAddress('')
        setAmountInLamports('')
        setPaymentId('')
      } else {
        console.error('Failed to initialize escrow:', error, logs)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Recipient Address</label>
        <Input
          type="text"
          placeholder="Enter recipient wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={initMutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount (Lamports)</label>
        <Input
          type="number"
          placeholder="Enter amount in lamports"
          value={amountInLamports}
          onChange={(e) => setAmountInLamports(e.target.value)}
          disabled={initMutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Payment ID</label>
        <Input
          type="number"
          placeholder="Enter payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          disabled={initMutation.isPending}
        />
      </div>
      <Button type="submit" disabled={initMutation.isPending || !recipientAddress || !amountInLamports || !paymentId}>
        Initialize Escrow{initMutation.isPending && '...'}
      </Button>
    </form>
  )
}
