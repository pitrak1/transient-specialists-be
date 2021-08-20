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
import { loginController } from './src/controllers/loginController.js'
import { equipmentController } from './src/controllers/equipmentController.js'
import { itemGroupsController } from './src/controllers/itemGroupsController.js'
import { modelsController } from './src/controllers/modelsController.js'
import { oemsController } from './src/controllers/oemsController.js'
import { reportsController } from './src/controllers/reportsController.js'
import { typesController } from './src/controllers/typesController.js'

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

app.use('/login', loginController(connection, requireAuth))
app.use('/equipment', equipmentController(connection, requireAuth))
app.use('/itemGroups', itemGroupsController(connection, requireAuth))
app.use('/models', modelsController(connection, requireAuth))
app.use('/oems', oemsController(connection, requireAuth))
app.use('/reports', reportsController(connection, requireAuth))
app.use('/types', typesController(connection, requireAuth))

app.listen(port, () => console.log(`Listening on ${ port }`))