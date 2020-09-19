const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID

const connectionURL = "mongodb://127.0.0.1:27017"
const databaseName = "Task-Manager" //db name

const id = new ObjectID()
//console.log(id)

mongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, clinet) => {
    if (error) {
        return console.log('Unable to connect to database')
    }

    const db = clinet.db(databaseName)

    // db.collection('Users').deleteMany({age:20}).then((result)=>{
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    db.collection('Tasks').deleteOne({description: "Study"}).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })

})


