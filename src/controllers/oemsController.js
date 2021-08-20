import express from 'express'

export const oemsController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		const oems = await connection.from('oems')
		  .column(['id', 'name'])
		  .select()
		res.json(oems)
	})

	return router
}
