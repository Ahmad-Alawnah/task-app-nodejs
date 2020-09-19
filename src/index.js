const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task')
const Task = require('./Models/task')
const User = require('./Models/user')

require('./DB/mongoose.js')

const app = express()
const port = process.env.PORT

// app.use((req, res, next) => { //middleware for express to run before route handler
//     //console.log(req.method)//get, post, etc ...
//     //console.log(req.path) // /users, /tasks, etc
//     if (req.method === "GET"){
//         res.send('GET requests are disabled')
//     }
//     else{
//         next()
//     }
//     next()
// })

// app.use((req,res,next) =>{
//     res.status(503).send('Under maintenance')
// })
app.use(express.json()) //auto parse incoming JSON into objects
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('server is up on port ' + port)
})

// const fcn = async () =>{
//     const pass = 'red12345!'
//     const hashedPass = await bcyrpt.hash(pass, 8) //number of times it will be hashed (too few: easy to crack, too much: slow, 8 is ideal)
//     console.log(pass)
//     console.log(hashedPass)

//     const isMatch = await bcyrpt.compare(pass, hashedPass)
//     console.log(isMatch)
// }
// //hashing algs are not reversable, but encryption algs are
// fcn()

// const fcn = async () => {
//     const token = jwt.sign({
//         _id: 'dummyID'
//     }, 'this is my new thing', {//2nd parameter is a string to make sure token wasnt modified (secret signiture)
//         expiresIn: '7 days' //options object
//     }) 
//     console.log(token)
//     const data = jwt.verify(token, 'this is my new thing')
//     console.log(data)
// }

// fcn()

// const main = async ()=>{
//     //find user through a task
//     // const task = await Task.findById("5f607a13320fd84ab47071e9")
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     //find tasks through a user
//     const user = await User.findById('5f6079dd320fd84ab47071e6')
//     await (await user.populate('tasks')).execPopulate()
//     console.log(user.tasks)
// }

// main()


// const upload = multer({dest: 'images'})
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// })

