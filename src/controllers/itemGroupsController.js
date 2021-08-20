import express from 'express'

export const itemGroupsController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		const itemGroups = await connection.from('item_groups')
		  .column(['id', 'name'])
		  .select()
		res.json(itemGroups)
	})

	return router
}
