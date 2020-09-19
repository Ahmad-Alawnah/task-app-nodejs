const sgmail = require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
    sgmail.send({ //returns a promise btw
        to: email,
        from: 'aalawneh19@gmail.com',
        subject: 'Welcome to task app',
        text: `Welcome to the app ${name},\nI hope you enjoy the app.`
    })
}

const sendByeEmail = (name, email) => {
    sgmail.send({
        to: email,
        from: 'aalawneh19@gmail.com',
        subject:'Bye from the task app',
        text: `good bye ${name}`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}