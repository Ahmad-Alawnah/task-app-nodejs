const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../Models/task')

const router = new express.Router()

router.post('/tasks',auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body, //all things in req.body
        owner: req.user._id
    })
    console.log(task.description)
    try {
        await task.save()
        res.status(201).send(task)
    }
    catch (e){
        res.status(400).send(e)
    }

    // task.save()
    //     .then(() => {
    //         res.status(201).send(task)
    //     })
    //     .catch((error) => {
    //         res.status(400).send(error)
    //     })
})

//GET /tasks?completed=false (or true)
// limit={number} (number of elements in a page)
// skip={number} (number of elements to skip)
// sortBy={criteria(field, asc or desc)} ex: sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed){ 
        match.completed = req.query.completed ==='true'?true:false
    }

    if (req.query.sortBy){
        const values = req.query.sortBy.split(':')
        sort[values[0]] = values[1]==='asc'? 1 : -1
    }
    try{
        //const tasks = await Task.find({owner: req.user._id})
        //or use populate
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks) //req.user.tasks
    }
    catch (e){
        res.status(500).send(e.message)
    }
    // Task.find({})
    //     .then((tasks) =>{
    //         res.send(tasks)
    //     })
    //     .catch((error) =>{
    //         res.status(500).send()
    //     })
})

router.get('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id
    try{
        //const task = await Task.findById(id)
        const task = await Task.findOne({_id:id, owner: req.user._id})
        if (!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
    // Task.findById(id)
    //     .then((task) =>{
    //         if (!task){
    //             return res.status(404).send()
    //         }
    //         res.send(task)
    //     })
    //     .catch((error) =>{
    //         res.status(500).send()
    //     })
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const allowedUpdates = ['description', 'completed']
    const actualUpdates = Object.keys(req.body)

    const isValid = actualUpdates.every((element) => allowedUpdates.includes(element))

    if (!isValid){
        return res.status(400).send({error: "invalid updates"})
    }
    const id = req.params.id

    try{
        //const task = await Task.findByIdAndUpdate(id, req.body, {runValidators: true, new: true })

        const task = await Task.findOne({_id:id, owner:req.user._id})
        if (!task){
            return res.status(404).send({error: 'not found'})
        }
        actualUpdates.forEach((update)=> task[update] = req.body[update])
        await task.save() //validation will be applied here
        res.send(task)
    }
    catch (e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id
    try{
        const task = await Task.findOneAndDelete({_id:id, owner: req.user._id})
        if (!task){
            return res.status(404).send({error: 'not found'})
        }
        res.send(task)
    }
    catch (e){
        res.status(500).send(e.message)
    }
})

module.exports = router