import knex from 'knex'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { dbConnection } from './dbConnection.js'

dotenv.config()

const connection = dbConnection()

const cleanup = async () => {
	await connection.schema.dropTableIfExists('tokens')
	await connection.schema.dropTableIfExists('users')
	console.log('Done cleaning up')
}

const creatingTables = async () => {
	await connection.schema.createTable('users', table => {
	  	table.increments('id')
	  	table.string('username')
	  	table.string('password')
	})

	await connection.schema.createTable('tokens', table => {
		table.increments('id')
		table.string('value')
		table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
		table.timestamps()
	})
	console.log('Done creating tables')
}

const addingData = async () => {
	// test/test
    await connection('users').insert({ username: 'test', password: '$2b$10$fXTWDN1PsPOYB1Q29/CcBujYO5jBh20stVNB5Jx0Ajv2DfEgV00dC' })

	console.log('Done adding data')
}

await cleanup()
await creatingTables()
await addingData()

process.exit(0)