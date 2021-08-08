import knex from 'knex'

export const dbConnection = () => {
    console.log(`Connecting to remote database at ${process.env.DATABASE_URL}`)
    return knex({
        client: 'pg',
        connection:  {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
    })
}