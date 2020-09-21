const { response } = require('express')
const request = require('supertest')
const app = require('../src/app.js')
const User = require('../src/Models/user')
const {user1, user1ID, setupDB} = require('./fixtures/db')

beforeEach(setupDB)

// afterEach(()=>{
//     console.log('after each')
// })

test('Sign up test', async () =>{
    const response = await request(app)
          .post('/users')
          .send({
              name: 'Ahmad',
              email: 'AHM20170105@std.psut.edu.jo',
              password: 'Ahmad12345'
          })
          .expect(201)
    
    //assert that the user exists in db
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBe(null)

    //assertions about the response
    expect(response.body).toMatchObject({
        user:{
            name: 'Ahmad',
            email: 'ahm20170105@std.psut.edu.jo'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Ahmad1234')
})

test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})


test('login in non-existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'oogabooga@example.com',
        password: 'n-word1234'
    }).expect(400)
})

test('get profile authorized', async () =>{
    await request(app)
          .get('/users/me')
          .set('Authorization', `Bearer ${user1.tokens[0].token}`)
          .send()
          .expect(200)
})

test('get profile unauthorized', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('delete accounted authorized', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(user1._id)
    expect(user).toBeNull()
})

test('delete accounted unauthorized', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/image3.jpg')
        .expect(200)

    const user = await User.findById(user1._id)
    expect(user.avatar).toEqual(expect.any(Buffer)) //toBe ===, to equal compares attributes
})

test('update valid fields', async () =>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({name:'Ali'})
        .expect(200)

    const user = await User.findById(user1._id)
    expect(user.name).toBe('Ali')
})

test('update invalid fields', async () =>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({location: 'efwkalod'})
        .expect(400)


})