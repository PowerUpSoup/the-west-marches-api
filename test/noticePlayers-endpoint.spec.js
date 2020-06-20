const knex = require('knex')
const app = require('../src/app')
const { makeNoticesArray } = require('./notices.fixtures.js')
const { makeNoticePlayersArray } = require('./noticePlayers.fixtures.js')

describe('NoticePlayer Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the notices table', () => db.raw('TRUNCATE notices RESTART IDENTITY CASCADE'))
    before('clean the noticeplayers table', () => db.raw('TRUNCATE noticeplayers RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noticePlayers RESTART IDENTITY CASCADE'))

    describe(`GET /api/notices/players`, () => {
        context(`Given no noticePlayers`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notices/players')
                    .expect(200, [])
            })
        })

        context('Given there are noticePlayers in the database', () => {
            const testNotices = makeNoticesArray()
            const testNoticePlayers = makeNoticePlayersArray()

            beforeEach('insert notices', () => {
                return db
                    .into('notices')
                    .insert(testNotices)
            })

            beforeEach('insert noticePlayers', () => {
                return db
                    .into('noticeplayers')
                    .insert(testNoticePlayers)
            })

            it('responds with 200 and all of the noticePlayers', () => {
                return supertest(app)
                    .get('/api/notices/players')
                    .expect(200, testNoticePlayers)
            })
        })
    })

    describe(`GET /api/notices/players/:id`, () => {
        context(`Given no noticePlayers`, () => {
            it(`responds with 404`, () => {
                const noticePlayerId = 123456
                return supertest(app)
                    .get(`/api/notices/players/${noticePlayerId}`)
                    .expect(404, { error: { message: `NoticePlayer doesn't exist` } })
            })
        })

        context('Given there are noticePlayers in the database', () => {
            const testNotices = makeNoticesArray()
            const testNoticePlayers = makeNoticePlayersArray()

            beforeEach('insert noticePlayers', () => {
                return db
                    .into('noticeplayers')
                    .insert(testNoticePlayers)
            })

            it('responds with 200 and the specified noticePlayer', () => {
                const noticePlayerId = 1
                const expectedNoticePlayer = testNoticePlayers[noticePlayerId - 1]
                return supertest(app)
                    .get(`/api/notices/players/${noticePlayerId}`)
                    .expect(200, expectedNoticePlayer)
            })
        })
    })

    describe(`POST /api/notices/players`, () => {
            it(`creates a noticePlayer, responding with 201 and the new noticePlayer`, () => {
                const newNoticePlayer = {
                    notice_id: 1,
                    name: 'New Test Player Name',
                }
                return supertest(app)
                    .post('/api/notices/players')
                    .send(newNoticePlayer)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.notice_id).to.eql(newNoticePlayer.notice_id)
                        expect(res.body.name).to.eql(newNoticePlayer.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/notices/players/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/players/${res.body.id}`)
                            .expect(res.body)
                    )
            })

        const requiredFields = ['notice_id', 'name']

        requiredFields.forEach(field => {
            const newNoticePlayer = {
                notice_id: 1,
                name: 'New Test Player Name',
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNoticePlayer[field]

                return supertest(app)
                    .post('/api/notices/players')
                    .send(newNoticePlayer)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`PATCH /api/notices/players/:id`, () => {
        context(`Given no noticePlayers`, () => {
            it(`responds with 404`, () => {
                const noticePlayerId = 123456
                return supertest(app)
                    .delete(`/api/notices/players/${noticePlayerId}`)
                    .expect(404, { error: { message: `NoticePlayer doesn't exist` } })
            })
        })

        context('Given there are noticePlayers in the database', () => {
            const testNoticePlayers = makeNoticePlayersArray()

            beforeEach('insert noticePlayers', () => {
                return db
                    .into('noticeplayers')
                    .insert(testNoticePlayers)
            })

            it('responds with 204 and updates the noticePlayer', () => {
                const idToUpdate = 1
                const updateNoticePlayer = {
                    name: 'updated noticePlayer name',
                }
                const expectedNoticePlayer = {
                    ...testNoticePlayers[idToUpdate - 1],
                    ...updateNoticePlayer
                }
                return supertest(app)
                    .patch(`/api/notices/players/${idToUpdate}`)
                    .send(updateNoticePlayer)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/players/${idToUpdate}`)
                            .expect(expectedNoticePlayer)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/notices/players/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain one of: 'notice_id', 'name'`
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateNoticePlayer = {
                    name: 'Some Other Name',
                }
                const expectedNoticePlayer = {
                    ...testNoticePlayers[idToUpdate - 1],
                    ...updateNoticePlayer
                }

                return supertest(app)
                    .patch(`/api/notices/players/${idToUpdate}`)
                    .send({
                        ...updateNoticePlayer,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/players/${idToUpdate}`)
                            .expect(expectedNoticePlayer)
                    )
            })
        })
    })
})