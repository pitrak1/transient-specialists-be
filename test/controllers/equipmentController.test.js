import assert from 'assert'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { app } from '../../index.js'
import { dbConnection } from '../../src/dbConnection.js'
import { cleanup, creatingTables, addingData } from '../../src/seedFunctions.js'

const should = chai.should()
chai.use(chaiHttp)

const connection = dbConnection()
let token = ''

before(async () => {
    await cleanup(connection)
    await creatingTables(connection)
    await addingData(connection)
    const tokenData = await connection.select('*').from('tokens')
    token = tokenData[0].value
})

after(() => {
    connection.destroy()
})

describe('equipmentController', function() {
    describe ('GET /', function() {
        it('gets all equipment', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .end((err, res)=>{
                    res.should.have.status(200)
                    res.body.should.have.lengthOf(6)
                    done()
                })
        })

        it('gets most recent events', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .end((err, res)=>{
                    res.should.have.status(200)
                    const equipment = res.body.find(e => e.id === 2)
                    equipment.event_status.should.equal('READY')
                    done()
                })
        })
    })
})