import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }): React.JSX.Element {
  return (
    <div className='rounded-2xl border border-dashed bg-card p-10 text-center'>
      <Inbox className='mx-auto h-8 w-8 text-muted-foreground' />
      <h3 className='mt-3 text-base font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}
