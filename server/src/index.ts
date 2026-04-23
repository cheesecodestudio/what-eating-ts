import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import ingredientsRouter from './routes/ingredients'
import dishesRouter from './routes/dishes'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/ingredients', ingredientsRouter)
app.use('/api/dishes', dishesRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
