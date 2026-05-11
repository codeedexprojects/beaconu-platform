import { ModulePage } from '@/src/components/layouts/module-page'
import { EmptyState } from '@/src/components/ui/empty-state'

export function ModuleView({ title, description }: { title: string; description: string }): React.JSX.Element {
  return (
    <ModulePage title={title} description={description} tag='Module'>
      <EmptyState
        title={`${title} workspace is ready`}
        description='Wire TanStack Query hooks, DTO mappers, and forms for CRUD workflows.'
      />
    </ModulePage>
  )
}
