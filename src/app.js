require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
// const cors = require('cors')
const helmet = require('helmet')
const usersRouter = require('./users/users-router')
const charactersRouter = require('./characters/characters-router')
const noticesRouter = require('./notices/notices-router')

const app = express()

const morganOption = (process.env.NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// )

app.use('/api/users', usersRouter)
app.use('/api/characters', charactersRouter)
app.use('/api/notices', noticesRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})


module.exports = app