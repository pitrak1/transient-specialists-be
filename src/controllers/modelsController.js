import express from 'express'

export const modelsController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		const models = await connection.from('models')
		  .column([{ id: 'models.id', name: 'models.name', oem_id: 'oems.id', oem_name: 'oems.name' }])
		  .select()
		  .join('oems', 'oems.id', '=', 'models.oem_id')
		res.json(models)
	})

	return router
}
