import express from 'express'
import path from 'path'
import ejs from 'ejs'
import pg from 'pg'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import knex from 'knex'
import cors from 'cors'
import { dbConnection } from './src/dbConnection.js'
import hat from 'hat'
import { requireAuth } from './src/requireAuth.js'

const __dirname = path.resolve(path.dirname(''))
const port = process.env.PORT || 3000
const connection = dbConnection()

const app = express()

const corsOptions = {
    origin: ['https://transient-specialists-fe.herokuapp.com', 'http://localhost:5000'],
    credentials: true
}

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use(async (req, res, next) => {
    const authToken = req.headers['authorization']
    if (authToken) {
        const user = await connection.from('users')
            .column([{ id: 'users.id' }, 'username', 'password'])
            .select()
            .join('tokens', 'tokens.user_id', '=', 'users.id')
            .where('value', authToken)
        req.user = user
    }
    next()
})

app.post('/login', async (req, res) => {
    const user = (await connection('users').where({ username: req.body.username }))[0]
    await bcrypt.compare(req.body.password, user.password, async (err, result) => {
        if (result) {
            const authToken = hat()
            await connection('tokens').insert({ value: authToken, user_id: user.id })
            res.json({ authToken })
        } else {
            res.sendStatus(403)
        }
    })
})

app.get('/equipment', requireAuth, async (req, res) => {
    const equipment = await connection.from('equipment')
      .column([{ model: 'models.name', oem: 'oems.name', type: 'types.name' }, 'serial_number', 'notes'])
      .select()
      .join('models', 'models.id', '=', 'equipment.model_id')
      .join('oems', 'oems.id', '=', 'models.oem_id')
      .join('types', 'types.id', '=', 'equipment.type_id')
    res.json(equipment)
})

app.listen(port, () => console.log(`Listening on ${ port }`))