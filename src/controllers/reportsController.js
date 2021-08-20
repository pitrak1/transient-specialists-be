import express from 'express'

export const reportsController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		res.statusCode(200)
	})

	return router
}
