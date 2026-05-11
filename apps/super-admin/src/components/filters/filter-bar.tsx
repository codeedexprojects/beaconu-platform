import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function FilterBar(): React.JSX.Element {
  return (
    <div className='flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm'>
      <Input placeholder='Search by name, code, owner...' className='h-9 w-64' />
      <Button variant='outline' size='sm'>Status</Button>
      <Button variant='outline' size='sm'>Role</Button>
      <Button variant='outline' size='sm'>Date range</Button>
      <Button size='sm'>Apply</Button>
    </div>
  )
}
