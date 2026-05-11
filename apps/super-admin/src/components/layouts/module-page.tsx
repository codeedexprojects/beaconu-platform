'use client'

import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'

interface ModulePageProps {
  title: string
  description: string
  tag?: string
  children?: React.ReactNode
}

export function ModulePage({ title, description, tag, children }: ModulePageProps): React.JSX.Element {
  return (
    <div className='flex min-h-full flex-col'>
      <Header title={title} description={description} />
      <div className='space-y-6 p-6'>
        {tag ? <Badge variant='secondary'>{tag}</Badge> : null}
        {children}
      </div>
    </div>
  )
}
