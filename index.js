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
	  .column([{ 
	  	event_id: 'recent_events.id',
	  	event_status: 'recent_events.status',
	  	event_job_number: 'recent_events.job_number',
	  	event_company_notes: 'recent_events.company_notes',
	  	event_start_date: 'recent_events.start_date',
	  	event_end_date: 'recent_events.end_date',
	  	model_id: 'models.id',
			model: 'models.name',
			oem_id: 'oems.id',
			oem: 'oems.name',
			type_id: 'types.id',
			type: 'types.name' 
		}, 'serial_number', 'notes'])
	  .select()
	  .join('models', 'models.id', '=', 'equipment.model_id')
	  .join('oems', 'oems.id', '=', 'models.oem_id')
	  .join('types', 'types.id', '=', 'equipment.type_id')
	  .join('recent_events', 'recent_events.equipment_id', '=', 'equipment.id')
	res.json(equipment)
})

app.get('/oems', requireAuth, async (req, res) => {
	const oems = await connection.from('oems')
	  .column(['id', 'name'])
	  .select()
	res.json(oems)
})

app.get('/models', requireAuth, async (req, res) => {
	const models = await connection.from('models')
	  .column([{ id: 'models.id', name: 'models.name', oem_id: 'oems.id', oem_name: 'oems.name' }])
	  .select()
	  .join('oems', 'oems.id', '=', 'models.oem_id')
	res.json(models)
})

app.get('/types', requireAuth, async (req, res) => {
	const types = await connection.from('types')
	  .column(['id', 'name'])
	  .select()
	res.json(types)
})

app.get('/itemGroups', requireAuth, async (req, res) => {
	const itemGroups = await connection.from('item_groups')
	  .column(['id', 'name'])
	  .select()
	res.json(itemGroups)
})

app.listen(port, () => console.log(`Listening on ${ port }`))