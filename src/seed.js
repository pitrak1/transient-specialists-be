import knex from 'knex'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()
import { dbConnection } from './dbConnection.js'
import { cleanup, creatingTables, addingData } from './seedFunctions.js'

const connection = dbConnection()

await cleanup(connection)
await creatingTables(connection)
await addingData(connection)

process.exit(0)