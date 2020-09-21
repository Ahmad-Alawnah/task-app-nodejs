const request = require('supertest')
const app = require('../src/app.js')
const Task = require('../src/Models/task')
const {    
    user1ID,
    user1,
    user2ID,
    user2,
    task1,
    setupDB
} = require('./fixtures/db.js')

beforeEach(setupDB)


test('Create task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            description: 'Sleep'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})


test('get all tasks for a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('delete task of another user', async () => {
    await request(app)
        .delete(`tasks/${task1._id}`)
        .set('Authorization', `Bearer ${user2.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(task1._id)
    expect(task).not.toBeNull()
})

