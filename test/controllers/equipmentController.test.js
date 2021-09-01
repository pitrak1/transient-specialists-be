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
        it('respects page size', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .send({
                    sortBy: 'id',
                    ascending: true,
                    perPage: 3,
                    page: 0
                })
                .end((err, res)=>{
                    res.should.have.status(200)
                    res.body.equipment.should.have.lengthOf(3)
                    res.body.equipment.map(e => e.id).should.deep.equal([1, 2, 3])
                    done()
                })
        })

        it('respects page number', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .send({
                    sortBy: 'id',
                    ascending: true,
                    perPage: 3,
                    page: 1
                })
                .end((err, res)=>{
                    res.should.have.status(200)
                    res.body.equipment.should.have.lengthOf(3)
                    res.body.equipment.map(e => e.id).should.deep.equal([4, 5, 6])
                    done()
                })
        })

        it('gets most recent events', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .send({
                    sortBy: 'id',
                    ascending: true,
                    perPage: 3,
                    page: 0
                })
                .end((err, res)=>{
                    res.should.have.status(200)
                    const equipment = res.body.equipment.find(e => e.id === 2)
                    equipment.event_status.should.equal('READY')
                    done()
                })
        })

         it('gets count', (done) => {
            chai.request(app)
                .get('/equipment/')
                .set('authorization', token)
                .send({
                    sortBy: 'id',
                    ascending: true,
                    perPage: 3,
                    page: 0
                })
                .end((err, res)=>{
                    res.should.have.status(200)
                    res.body.count.should.equal('6')
                    done()
                })
        })
    })

    describe ('GET /:equipmentId', function() {
        it('gets most recent events', (done) => {
            chai.request(app)
                .get('/equipment/2')
                .set('authorization', token)
                .end((err, res)=>{
                    res.should.have.status(200)
                    res.body[0].event_status.should.equal('READY')
                    done()
                })
        })
    })
})