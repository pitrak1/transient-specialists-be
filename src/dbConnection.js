import knex from 'knex'

export const dbConnection = () => {
    if (process.env.USE_LOCAL) {
        console.log(`Connecting to local database`)
        return knex({
            client: 'pg',
            connection:  {
                host: process.env.LOCAL_DATABASE_URL,
                database: 'postgres'
            }
        })
    } else {
        console.log(`Connecting to remote database at ${process.env.DATABASE_URL}`)
        return knex({
            client: 'pg',
            connection:  {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            }
        })
    }
}