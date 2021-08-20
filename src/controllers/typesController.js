import express from 'express'

export const typesController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		const types = await connection.from('types')
		  .column(['id', 'name'])
		  .select()
		res.json(types)
	})

	return router
}
