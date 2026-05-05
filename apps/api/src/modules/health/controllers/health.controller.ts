import { Router, Request, Response } from 'express'
import { getHealthStatus } from '@/modules/health/services/health.service'

const router: Router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const health = await getHealthStatus()
  res.status(health.status === 'ok' ? 200 : 503).json({
    success: true,
    data: health,
  })
})

export default router
