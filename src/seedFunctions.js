export const cleanup = async (connection) => {
	await connection.schema.dropTableIfExists('tokens')
	await connection.schema.dropTableIfExists('users')
	await connection.schema.raw('DROP VIEW IF EXISTS recent_events;')
	await connection.schema.dropTableIfExists('files')
	await connection.schema.dropTableIfExists('handles')
	await connection.schema.dropTableIfExists('events')
	await connection.schema.dropTableIfExists('equipment')
	await connection.schema.dropTableIfExists('item_groups_models')
	await connection.schema.dropTableIfExists('models')
	await connection.schema.dropTableIfExists('item_groups')
	await connection.schema.dropTableIfExists('oems')
	await connection.schema.dropTableIfExists('types')
	console.log('Done cleaning up')
}

export const creatingTables = async (connection) => {
	await connection.schema.createTable('types', table => {
	  	table.increments('id')
	  	table.string('name').notNullable()
	})
	await connection.schema.raw(`CREATE UNIQUE INDEX idx_types_name ON types(lower(name))`)

	await connection.schema.createTable('oems', table => {
	  	table.increments('id')
	  	table.string('name').notNullable()
	})
	await connection.schema.raw(`CREATE UNIQUE INDEX idx_oems_name ON oems(lower(name))`)

	await connection.schema.createTable('item_groups', table => {
	  	table.increments('id')
	  	table.string('name').notNullable()
	})
	await connection.schema.raw(`CREATE UNIQUE INDEX idx_item_groups_name ON item_groups(lower(name))`)

	await connection.schema.createTable('models', table => {
	  	table.increments('id')
	  	table.string('name').notNullable()
	  	table.integer('oem_id').notNullable().references('id').inTable('oems')
	})
	await connection.schema.raw(`CREATE UNIQUE INDEX idx_models_name ON models(lower(name))`)

	await connection.schema.createTable('item_groups_models', table => {
	  	table.increments('id')
	  	table.integer('model_id').notNullable().references('id').inTable('models')
	  	table.integer('item_group_id').notNullable().references('id').inTable('item_groups')
	})

	await connection.schema.createTable('equipment', table => {
	  	table.increments('id')
	  	table.string('serial_number').notNullable()
	  	table.string('notes')
	  	table.integer('current_event')
	  	table.string('cal_company')
	  	table.string('cal_due')
	  	table.integer('type_id').notNullable().references('id').inTable('types')
	  	table.integer('model_id').notNullable().references('id').inTable('models')
	})
	await connection.schema.raw(`CREATE UNIQUE INDEX idx_equipment_serial_number ON equipment(lower(serial_number))`)

	await connection.schema.createTable('events', table => {
		table.increments('id')
	  	table.string('status')
	  	table.string('job_number')
	  	table.integer('company_notes')
	  	table.timestamp('start_date')
	  	table.timestamp('end_date')
	  	table.timestamps()
	  	table.integer('equipment_id').notNullable().references('id').inTable('equipment')
	})

	await connection.schema.createTable('handles', table => {
		table.increments('id')
	  	table.string('handle').notNullable()
	  	table.integer('item_group_id').notNullable().references('id').inTable('item_groups')
	})

	await connection.schema.createTable('files', table => {
		table.increments('id')
	  	table.string('name').notNullable()
	  	table.text('contents').notNullable()
	  	table.integer('equipment_id').notNullable().references('id').inTable('equipment')
	})

	await connection.schema.raw(`
		CREATE VIEW recent_events AS
		SELECT
			y.id AS id,
			y.status AS status,
			y.job_number AS job_number,
			y.company_notes AS company_notes,
			y.start_date AS start_date,
			y.end_date AS end_date,
		  	y.equipment_id AS equipment_id
		FROM (
			SELECT
				x.id,
				x.status,
				x.job_number,
				x.company_notes,
				x.start_date,
				x.end_date,
				x.updated_at,
				x.equipment_id,
				ROW_NUMBER() OVER(
				PARTITION BY x.equipment_id ORDER BY x.updated_at DESC
				) AS rk
			FROM events x
		) y
		WHERE y.rk = 1;
	`)

	await connection.schema.createTable('users', table => {
	  	table.increments('id')
	  	table.string('username')
	  	table.string('password')
	})

	await connection.schema.createTable('tokens', table => {
		table.increments('id')
		table.string('value')
		table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
		table.timestamps()
	})

	console.log('Done creating tables')
}

export const addingData = async (connection) => {
	// test/test
    await connection('users').insert({ username: 'test', password: '$2b$10$fXTWDN1PsPOYB1Q29/CcBujYO5jBh20stVNB5Jx0Ajv2DfEgV00dC' })

    await connection('tokens').insert({ value: 'faketoken', user_id: 1 })

    await connection('types').insert({ name: 'Type abc 1' })
    await connection('types').insert({ name: 'Type ab 2' })
    await connection('types').insert({ name: 'Type a 3' })

    await connection('oems').insert({ name: 'OEM abc 1' })
    await connection('oems').insert({ name: 'OEM ab 2' })
    await connection('oems').insert({ name: 'OEM a 3' })

    await connection('item_groups').insert({ name: 'First' })
    await connection('item_groups').insert({ name: 'Second' })
    await connection('item_groups').insert({ name: 'Third' })

    await connection('models').insert({ name: 'Model abcdef 1', oem_id: 1 })
    await connection('models').insert({ name: 'Model abcde 2', oem_id: 2 })
    await connection('models').insert({ name: 'Model abcd 3', oem_id: 2 })
    await connection('models').insert({ name: 'Model abc 4', oem_id: 3 })
    await connection('models').insert({ name: 'Model ab 5', oem_id: 3 })
    await connection('models').insert({ name: 'Model a 6', oem_id: 3 })

    await connection('item_groups_models').insert({ item_group_id: 1, model_id: 1 })
    await connection('item_groups_models').insert({ item_group_id: 1, model_id: 2 })
    await connection('item_groups_models').insert({ item_group_id: 1, model_id: 3 })
    await connection('item_groups_models').insert({ item_group_id: 1, model_id: 4 })
    await connection('item_groups_models').insert({ item_group_id: 3, model_id: 5 })
    await connection('item_groups_models').insert({ item_group_id: 3, model_id: 6 })

	await connection('equipment').insert({ serial_number: 'Equipment abcdef 1', type_id: 1, model_id: 6 })
	await connection('equipment').insert({ serial_number: 'Equipment abcde 2', type_id: 1, model_id: 4 })
	await connection('equipment').insert({ serial_number: 'Equipment abcd 3', type_id: 3, model_id: 4 })
	await connection('equipment').insert({ serial_number: 'Equipment abc 4', type_id: 3, model_id: 2 })
	await connection('equipment').insert({ serial_number: 'Equipment ab 5', type_id: 2, model_id: 2 })
	await connection('equipment').insert({ serial_number: 'Equipment a 6', type_id: 2, model_id: 2 })

	await connection('events').insert({ status: 'READY', equipment_id: 2, updated_at: '2017-12-19 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 2, updated_at: '2017-12-18 07:37:16-05' });
	await connection('events').insert({ status: 'OUT', equipment_id: 2, updated_at: '2017-12-17 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 2, updated_at: '2017-12-16 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 3, updated_at: '2018-12-17 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 4, updated_at: '2019-12-17 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 5, updated_at: '2017-12-17 07:37:16-05' });
	await connection('events').insert({ status: 'OUT', equipment_id: 6, updated_at: '2018-12-17 07:37:16-05' });
	await connection('events').insert({ status: 'READY', equipment_id: 6, updated_at: '2018-12-16 07:37:16-05' });
	await connection('events').insert({ status: 'OUT', equipment_id: 1, updated_at: '2018-06-19 07:37:16-05' });
	await connection('events').insert({ status: 'READY', equipment_id: 1, updated_at: '2017-04-18 07:37:16-05' });
	await connection('events').insert({ status: 'IN', equipment_id: 1, updated_at: '2019-09-17 07:37:16-05' });

	await connection('handles').insert({ handle: 'http://asdf1', item_group_id: 2 })
	await connection('handles').insert({ handle: 'http://asdf2', item_group_id: 2 })
	await connection('handles').insert({ handle: 'http://asdf3', item_group_id: 1 })
	await connection('handles').insert({ handle: 'http://asdf4', item_group_id: 1 })
	await connection('handles').insert({ handle: 'http://asdf5', item_group_id: 1 })
	await connection('handles').insert({ handle: 'http://asdf6', item_group_id: 1 })

	console.log('Done adding data')
}