import express from 'express'
import bcrypt from 'bcrypt'

export const loginController = (connection, requireAuth) => {
	const router = express.Router()

	router.use(async (req, res, next) => {
		const authToken = req.headers['authorization']
		if (authToken) {
			const user = await connection.from('users')
				.column([{ id: 'users.id' }, 'username', 'password'])
				.select()
				.join('tokens', 'tokens.user_id', '=', 'users.id')
				.where('value', authToken)
			req.user = user
		}
		next()
	})

	router.post('/', async (req, res) => {
		const user = (await connection('users').where({ username: req.body.username }))[0]
		await bcrypt.compare(req.body.password, user.password, async (err, result) => {
			if (result) {
				const authToken = hat()
				await connection('tokens').insert({ value: authToken, user_id: user.id })
				res.json({ authToken })
			} else {
				res.sendStatus(403)
			}
		})
	})

	return router
}
