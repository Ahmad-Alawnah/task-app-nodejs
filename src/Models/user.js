const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const schema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique:true, //unique emails
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email')
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be positive')
                }
            }
        },
        password: {
            type: String,
            minlength: 7,
            required: true,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('password cannot contain \"password\"')
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer
        }

}, { //options
    timestamps: true
})
//will not be stored in user
schema.virtual('tasks', {
    ref: 'Task',
    localField:'_id',
    foreignField: 'owner'

})

schema.methods.generateAuthToken = async function() { //accessiable on instances

    const token = jwt.sign({_id:this._id.toString()}, process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

schema.methods.toJSON = function(){
    const userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

schema.statics.findByCredentials = async (email, password) => { //static method
    const user = await User.findOne({email})
    if (!user){
        throw new Error('Unable to login')

    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

schema.pre('save', async function(next){ //must be a regular function
    //this refers to the user
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() //to indicate that we are done (since this fcn is async)
})

//delete tasks when user gets deleted
schema.pre('remove', async function(next){
    await Task.deleteMany({owner: this._id})
    next()
})


const User = mongoose.model('User', schema)
User.init()
module.exports = User