import { Router } from 'express'
import { BlinkController } from './blink.controller'
import { authenticate } from '../auth/auth.middleware'

const router: Router = Router()


router.post('/register', BlinkController.register)
router.post('/login', BlinkController.login)
router.post('/refresh', BlinkController.refresh)
router.post('/logout', BlinkController.logout)
router.get('/me', authenticate, BlinkController.getMe)

export default router
