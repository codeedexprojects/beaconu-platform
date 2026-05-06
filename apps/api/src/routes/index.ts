import { Router } from 'express'
import healthRouter from '@/modules/health/controllers/health.controller'
import blinkRouter from '@/modules/blink/blink.routes'

const router: Router = Router()

router.use('/health', healthRouter)
router.use('/blink', blinkRouter)
// sample 
export default router
