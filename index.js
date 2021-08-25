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
import { equipmentController } from './src/controllers/equipmentController.js'
import { itemGroupsController } from './src/controllers/itemGroupsController.js'
import { modelsController } from './src/controllers/modelsController.js'
import { oemsController } from './src/controllers/oemsController.js'
import { reportsController } from './src/controllers/reportsController.js'
import { typesController } from './src/controllers/typesController.js'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.resolve(path.dirname(''))
const port = process.env.PORT || 3000
const connection = dbConnection()

export const app = express()

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


app.use('/equipment', equipmentController(connection, requireAuth))
app.use('/itemGroups', itemGroupsController(connection, requireAuth))
app.use('/models', modelsController(connection, requireAuth))
app.use('/oems', oemsController(connection, requireAuth))
app.use('/reports', reportsController(connection, requireAuth))
app.use('/types', typesController(connection, requireAuth))

app.listen(port, () => console.log(`Listening on ${ port }`))