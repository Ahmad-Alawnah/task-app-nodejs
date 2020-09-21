const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/Models/user')
const Task = require('../../src/Models/task')

const user1ID = new mongoose.Types.ObjectId()
const user1 = {
    _id: user1ID,
    name: "Name1",
    email: "Name1@example.com",
    password:"Name11234",
    tokens: [{
        token: jwt.sign({_id:user1ID}, process.env.JWT_SECRET)
    }]
}

const user2ID = new mongoose.Types.ObjectId()
const user2 = {
    _id: user2ID,
    name: "Khalil",
    email: "Khalil@example.com",
    password:"Khalil12345",
    tokens: [{
        token: jwt.sign({_id:user1ID}, process.env.JWT_SECRET)
    }]
}

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'first task',
    owner: user1ID
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second task',
    completed: true,
    owner: user1ID
}

const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third task',
    owner: user2ID
}




const setupDB = async () => {
    await User.deleteMany() //delete all users
    await Task.deleteMany()
    await new User(user1).save()
    await new User(user2).save()
    await new Task(task1).save()
    await new Task(task2).save()
    await new Task(task3).save()
}

module.exports = {
    user1ID,
    user1,
    user2ID,
    user2,
    task1,
    setupDB
}