import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import channelRoutes from './routes/channel.routes.js'
import s3Routes from './routes/s3.routes.js'

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json('welcome to the new api')
})

app.use(userRoutes)
app.use(channelRoutes)
app.use(s3Routes)
export default app
