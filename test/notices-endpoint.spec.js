const knex = require('knex')
const app = require('../src/app')
const { makeNoticesArray } = require('./notices.fixtures.js')

describe('Notice Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE notices RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE notices RESTART IDENTITY CASCADE'))

    describe(`GET /api/notices`, () => {
        context(`Given no notices`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notices')
                    .expect(200, [])
            })
        })

        context('Given there are notices in the database', () => {
            const testNotices = makeNoticesArray()

            beforeEach('insert notices', () => {
                return db
                    .into('notices')
                    .insert(testNotices)
            })

            it('responds with 200 and all of the notices', () => {
                return supertest(app)
                    .get('/api/notices')
                    .expect(200, testNotices)
            })
        })
    })

    describe(`GET /api/notices/:id`, () => {
        context(`Given no notices`, () => {
            it(`responds with 404`, () => {
                const noticeId = 123456
                return supertest(app)
                    .get(`/api/notices/${noticeId}`)
                    .expect(404, { error: { message: `Notice doesn't exist` } })
            })
        })

        context('Given there are notices in the database', () => {
            const testNotices = makeNoticesArray()

            beforeEach('insert notices', () => {
                return db
                    .into('notices')
                    .insert(testNotices)
            })

            it('responds with 200 and the specified notice', () => {
                const noticeId = 1
                const expectedNotice = testNotices[noticeId - 1]
                return supertest(app)
                    .get(`/api/notices/${noticeId}`)
                    .expect(200, expectedNotice)
            })
        })
    })

    describe(`POST /api/notices`, () => {
            it(`creates a notice, responding with 201 and the new notice`, () => {
                const newNotice = {
                    message: 'Test new message',
                    status: 'Open',
                }
                return supertest(app)
                    .post('/api/notices')
                    .send(newNotice)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.message).to.eql(newNotice.message)
                        expect(res.body.status).to.eql(newNotice.status)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/notices/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/${res.body.id}`)
                            .expect(res.body)
                    )
            })

        const requiredFields = ['message', 'status']

        requiredFields.forEach(field => {
            const newNotice = {
                message: 'Test notice message',
                status: 'Open',
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNotice[field]

                return supertest(app)
                    .post('/api/notices')
                    .send(newNotice)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`PATCH /api/notices/:id`, () => {
        context(`Given no notices`, () => {
            it(`responds with 404`, () => {
                const noticeId = 123456
                return supertest(app)
                    .delete(`/api/notices/${noticeId}`)
                    .expect(404, { error: { message: `Notice doesn't exist` } })
            })
        })

        context('Given there are notices in the database', () => {
            const testNotices = makeNoticesArray()

            beforeEach('insert notices', () => {
                return db
                    .into('notices')
                    .insert(testNotices)
            })

            it('responds with 204 and updates the notice', () => {
                const idToUpdate = 1
                const updateNotice = {
                    message: 'updated notice message',
                }
                const expectedNotice = {
                    ...testNotices[idToUpdate - 1],
                    ...updateNotice
                }
                return supertest(app)
                    .patch(`/api/notices/${idToUpdate}`)
                    .send(updateNotice)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/${idToUpdate}`)
                            .expect(expectedNotice)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/notices/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain one of: 'message', 'status'`
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateNotice = {
                    status: 'Picked Up',
                }
                const expectedNotice = {
                    ...testNotices[idToUpdate - 1],
                    ...updateNotice
                }

                return supertest(app)
                    .patch(`/api/notices/${idToUpdate}`)
                    .send({
                        ...updateNotice,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/${idToUpdate}`)
                            .expect(expectedNotice)
                    )
            })
        })
    })
})