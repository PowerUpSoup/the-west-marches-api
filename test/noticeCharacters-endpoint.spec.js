const knex = require('knex')
const app = require('../src/app')
const { makeNoticesArray } = require('./notices.fixtures.js')
const { makeNoticeCharactersArray } = require('./noticeCharacters.fixtures.js')

describe('NoticeCharacters Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noticeCharacters RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noticeCharacters RESTART IDENTITY CASCADE'))

    describe(`GET /api/notices/characters`, () => {
        context(`Given no noticeCharacters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notices/characters')
                    .expect(200, [])
            })
        })

        context('Given there are noticeCharacters in the database', () => {
            const testNotices = makeNoticesArray()
            const testNoticeCharacters = makeNoticeCharactersArray()

            beforeEach('insert notices', () => {
                return db
                    .into('notices')
                    .insert(testNotices)
            })

            beforeEach('insert noticeCharacters', () => {
                return db
                    .into('noticecharacters')
                    .insert(testNoticeCharacters)
            })

            it('responds with 200 and all of the noticeCharacters', () => {
                return supertest(app)
                    .get('/api/notices/characters')
                    .expect(200, testNoticeCharacters)
            })
        })
    })

    describe(`GET /api/notices/characters/:id`, () => {
        context(`Given no noticeCharacters`, () => {
            it(`responds with 404`, () => {
                const noticeCharactersId = 123456
                return supertest(app)
                    .get(`/api/notices/characters/${noticeCharactersId}`)
                    .expect(404, { error: { message: `NoticeCharacter doesn't exist` } })
            })
        })

        context('Given there are noticeCharacters in the database', () => {
            const testNotices = makeNoticesArray()
            const testNoticeCharacters = makeNoticeCharactersArray()

            beforeEach('insert noticeCharacters', () => {
                return db
                    .into('noticecharacters')
                    .insert(testNoticeCharacters)
            })

            it('responds with 200 and the specified noticeCharacters', () => {
                const noticeCharactersId = 1
                const expectedNoticeCharacters = testNoticeCharacters[noticeCharactersId - 1]
                return supertest(app)
                    .get(`/api/notices/characters/${noticeCharactersId}`)
                    .expect(200, expectedNoticeCharacters)
            })
        })
    })

    describe(`POST /api/notices/characters`, () => {
            it(`creates a noticeCharacters, responding with 201 and the new noticeCharacters`, () => {
                const newNoticeCharacters = {
                    notice_id: 1,
                    name: 'New Test Character Name',
                }
                return supertest(app)
                    .post('/api/notices/characters')
                    .send(newNoticeCharacters)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.notice_id).to.eql(newNoticeCharacters.notice_id)
                        expect(res.body.name).to.eql(newNoticeCharacters.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/notices/characters/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/characters/${res.body.id}`)
                            .expect(res.body)
                    )
            })

        const requiredFields = ['notice_id', 'name']

        requiredFields.forEach(field => {
            const newNoticeCharacter = {
                notice_id: 1,
                name: 'New Test Characters Name',
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNoticeCharacter[field]

                return supertest(app)
                    .post('/api/notices/characters')
                    .send(newNoticeCharacter)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`PATCH /api/notices/characters/:id`, () => {
        context(`Given no noticeCharacters`, () => {
            it(`responds with 404`, () => {
                const noticeCharacterId = 123456
                return supertest(app)
                    .delete(`/api/notices/characters/${noticeCharacterId}`)
                    .expect(404, { error: { message: `NoticeCharacter doesn't exist` } })
            })
        })

        context('Given there are noticeCharacters in the database', () => {
            const testNoticeCharacters = makeNoticeCharactersArray()

            beforeEach('insert noticeCharacters', () => {
                return db
                    .into('noticecharacters')
                    .insert(testNoticeCharacters)
            })

            it('responds with 204 and updates the noticeCharacters', () => {
                const idToUpdate = 1
                const updateNoticeCharacter = {
                    name: 'updated noticeCharacters name',
                }
                const expectedNoticeCharacter = {
                    ...testNoticeCharacters[idToUpdate - 1],
                    ...updateNoticeCharacter
                }
                return supertest(app)
                    .patch(`/api/notices/characters/${idToUpdate}`)
                    .send(updateNoticeCharacter)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/characters/${idToUpdate}`)
                            .expect(expectedNoticeCharacter)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/notices/characters/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain one of: notice_id, name`
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateNoticeCharacter = {
                    name: 'Some Other Name',
                }
                const expectedNoticeCharacter = {
                    ...testNoticeCharacters[idToUpdate - 1],
                    ...updateNoticeCharacter
                }

                return supertest(app)
                    .patch(`/api/notices/characters/${idToUpdate}`)
                    .send({
                        ...updateNoticeCharacter,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notices/characters/${idToUpdate}`)
                            .expect(expectedNoticeCharacter)
                    )
            })
        })
    })
})