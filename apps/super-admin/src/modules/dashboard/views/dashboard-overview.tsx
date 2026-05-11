import { Building2, GraduationCap, Users, HeartHandshake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModulePage } from '@/src/components/layouts/module-page'
import { MetricsChart } from '@/src/components/charts/metrics-chart'
import { EnterpriseDataTable } from '@/src/components/tables/enterprise-data-table'
import { FilterBar } from '@/src/components/filters/filter-bar'

const kpis = [
  { label: 'Total Colleges', value: '248', icon: Building2 },
  { label: 'Total Universities', value: '57', icon: GraduationCap },
  { label: 'Total Students', value: '94,312', icon: Users },
  { label: 'Active Counsellors', value: '94', icon: HeartHandshake },
]

export function DashboardOverview(): React.JSX.Element {
  return (
    <ModulePage title='Dashboard' description='Enterprise analytics across admissions, institutions, and operations' tag='Analytics'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{kpi.value}</p>
              <kpi.icon className='h-5 w-5 text-primary' />
            </CardContent>
          </Card>
        ))}
      </div>

      <FilterBar />

      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='xl:col-span-2'>
          <EnterpriseDataTable
            rows={[
              { id: '1', name: 'Lead Conversion Metrics', status: 'active' },
              { id: '2', name: 'Recent Registrations', status: 'pending' },
              { id: '3', name: 'Platform Activity', status: 'active' },
            ]}
          />
        </div>
        <MetricsChart />
      </div>
    </ModulePage>
  )
}
