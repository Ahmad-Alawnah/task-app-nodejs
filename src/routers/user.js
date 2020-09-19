const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../Models/user')
const auth = require('../middleware/auth')
const emails = require('../emails/account')
const router = express.Router()

const upload = multer({
    //dest: 'avatar', commented to avoid saving to file system instead sending it to us to save on DB
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        //cb(new Error('invalid type, accepted types: ')) //rejected
        //cb(undefined, true) //accepted

        if (!file.originalname.match(/\.(jpg|jpdg|png)$/)){ //regex
            return cb(new Error('Please upload an image'))
        }
        else{
            return cb(undefined, true)
        }
    }
})


router.post('/users', async (req, res) => {
    //console.log(req.body) //req.body is data  that is sent 
    const user = new User(req.body)
    try{
        await user.save()
        emails.sendWelcomeEmail(user.name, user.email)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }
    catch(e){
        res.status(400).send(e)
    }

    // user.save()
    //     .then(()=>{
    //         res.status(201).send(user)
    //     })
    //     .catch((error)=>{
    //         res.status(400).send(error)
    //     })

})

router.post('/users/login', async (req, res) => { 

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }
    catch (e){
        res.status(400).send(e.message)
    }
})

router.post('/users/signout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/users/signoutall', auth, async (req, res) =>{ 
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)

    // User.find({}) //returns all users
    //     .then((users)=>{
    //         res.send(users)
    //     })
    //     .catch((error) => {
    //         res.status(500).send()
    //     })
})

// router.get('/users/:id', auth, async (req, res) =>{ //dynamic route that we can access through code //setting a middleware for a specific route handler
//     const id = req.params.id //this is how we retrieve dynamic params

//     try{
//         const user = await User.findById(id)
//         if (!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }
//     catch(e){
//         res.status(500).send()
//     }

//     // User.findById(id)
//     //     .then((user)=>{
//     //         if (!user){
//     //             return res.status(404).send()
//     //         }
//     //         res.send(user)
//     //     })
//     //     .catch((error) => {
//     //             res.status(500).send()
//     //     })

// }) 


router.patch('/users/me', auth, async (req, res) =>{
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const actualUpdates = Object.keys(req.body) //returns attribute names are string
    let isValid = actualUpdates.every((element) => allowedUpdates.includes(element))
    if (!isValid){
        return res.status(400).send({error: 'invalid update'})
    }
    const id = req.user._id
    try{
        //this bypasses mongoose (so it wont call the post function)
        //const user = await User.findByIdAndUpdate(id, req.body, {new: true, runValidators: true}) //new: returns the new (updated) user
        //to solve it, do this (idk about validation though)
        actualUpdates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save() //validation will be applied here
        // if (!user){
        //     return res.status(404).send()
        // }
        res.send(req.user)
    }   
    catch (e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const id = req.user._id
    try{
        // const user = await User.findByIdAndDelete(id)
        // if (!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        emails.sendByeEmail(req.user.name, req.user.email)
        res.send(req.user)
    }
    catch (e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const modifiedImg = await sharp(req.file.buffer).png().resize({width:256, height:256}).toBuffer()
    req.user.avatar = modifiedImg
    await req.user.save()
    res.send()
}, (error, req, res, next) => { //error handler by express
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',  async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})





module.exports = router