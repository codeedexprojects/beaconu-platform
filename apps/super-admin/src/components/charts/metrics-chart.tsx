import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MetricsChart(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-56 rounded-xl border border-dashed bg-gradient-to-br from-muted/60 to-background p-4 text-sm text-muted-foreground'>
          Chart placeholder: integrate your analytics chart library with query-driven metrics.
        </div>
      </CardContent>
    </Card>
  )
}
