import express, { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { requestId } from '@/shared/middleware/request-id'
import { errorHandler } from '@/shared/middleware/error-handler'
import { NotFoundError } from '@/shared/errors'
import { env } from '@/shared/config/env'
import apiRouter from '@/routes/index'

const app: Express = express()

app.use(helmet())
app.use(
  cors({
    origin:
      env.NODE_ENV === 'development' ? true : [],
    credentials: true,
  }),
)
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(requestId)
app.use(morgan('combined'))

app.use('/api/v1', apiRouter)

app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'))
})

app.use(errorHandler)

export default app
