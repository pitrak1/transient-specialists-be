import express from 'express'

export const equipmentController = (connection, requireAuth) => {
	const router = express.Router()

	router.get('/', requireAuth, async (req, res) => {
		const equipment = await connection.from('equipment')
		  	.column([{
			  	id: 'equipment.id',
			  	event_id: 'recent_events.id',
			  	event_status: 'recent_events.status',
			  	event_job_number: 'recent_events.job_number',
			  	event_company_notes: 'recent_events.company_notes',
			  	event_start_date: 'recent_events.start_date',
			  	event_end_date: 'recent_events.end_date',
			  	model_id: 'models.id',
					model: 'models.name',
					oem_id: 'oems.id',
					oem: 'oems.name',
					type_id: 'types.id',
					type: 'types.name' 
				}, 'serial_number', 'notes'])
			.select()
			.join('models', 'models.id', '=', 'equipment.model_id')
			.join('oems', 'oems.id', '=', 'models.oem_id')
			.join('types', 'types.id', '=', 'equipment.type_id')
			.join('recent_events', 'recent_events.equipment_id', '=', 'equipment.id')
			.orderBy(req.body.sortBy, req.body.ascending ? 'asc' : 'desc')
			.limit(req.body.perPage)
			.offset(req.body.perPage * req.body.page)

		const count = await connection.from('equipment').count('*')
		res.json({ equipment, count: count[0].count })
	})

	router.get('/:equipmentId', requireAuth, async (req, res) => {
		const equipment = await connection.from('equipment')
			.column([{
				id: 'equipment.id',
			  	event_id: 'recent_events.id',
			  	event_status: 'recent_events.status',
			  	event_job_number: 'recent_events.job_number',
			  	event_company_notes: 'recent_events.company_notes',
			  	event_start_date: 'recent_events.start_date',
			  	event_end_date: 'recent_events.end_date',
			  	model_id: 'models.id',
					model: 'models.name',
					oem_id: 'oems.id',
					oem: 'oems.name',
					type_id: 'types.id',
					type: 'types.name' 
				}, 'serial_number', 'notes'])
			.select()
			.join('models', 'models.id', '=', 'equipment.model_id')
			.join('oems', 'oems.id', '=', 'models.oem_id')
			.join('types', 'types.id', '=', 'equipment.type_id')
			.join('recent_events', 'recent_events.equipment_id', '=', 'equipment.id')
			.where('equipment.id', '=', req.params.equipmentId)
		res.json(equipment)
	})

	return router
}
