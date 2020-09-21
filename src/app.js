const express = require('express')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task')

require('./DB/mongoose.js')

const app = express()

app.use(express.json()) //auto parse incoming JSON into objects
app.use(userRouter)
app.use(taskRouter)

module.exports = app