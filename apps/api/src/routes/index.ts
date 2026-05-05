import { Router } from 'express'
import healthRouter from '@/modules/health/controllers/health.controller'

const router: Router = Router()

router.use('/health', healthRouter)

export default router
