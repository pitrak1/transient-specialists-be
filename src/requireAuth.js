export const requireAuth = (req, res, next) => {
	if (req.user) {
		next()
	} else {
		res.sendStatus(403)
	}
}	