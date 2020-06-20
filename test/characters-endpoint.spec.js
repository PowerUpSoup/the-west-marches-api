const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeCharactersArray } = require('./characters.fixtures.js')

describe('Character Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the users table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))
    before('clean the characters table', () => db.raw('TRUNCATE characters RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE characters RESTART IDENTITY CASCADE'))

    describe(`GET /api/characters`, () => {
        context(`Given no characters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/characters')
                    .expect(200, [])
            })
        })

        context('Given there are characters in the database', () => {
            const testUsers = makeUsersArray()
            const testCharacters = makeCharactersArray()

            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })

            it('responds with 200 and all of the characters', () => {
                return supertest(app)
                    .get('/api/characters')
                    .expect(200, testCharacters)
            })
        })
    })

    describe(`GET /api/characters/:id`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .get(`/api/characters/${characterId}`)
                    .expect(404, { error: { message: `Character doesn't exist` } })
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray()

            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })

            it('responds with 200 and the specified character', () => {
                const characterId = 2
                const expectedCharacter = testCharacters[characterId - 1]
                return supertest(app)
                    .get(`/api/characters/${characterId}`)
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`POST /api/characters`, () => {
            it(`creates a character, responding with 201 and the new character`, () => {
                const newCharacter = {
                    user_id: 2,
                    name: 'Test new character',
                }
                return supertest(app)
                    .post('/api/characters')
                    .send(newCharacter)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.user_id).to.eql(newCharacter.user_id)
                        expect(res.body.name).to.eql(newCharacter.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/characters/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/characters/${res.body.id}`)
                            .expect(res.body)
                    )
            })

        const requiredFields = ['user_id', 'name']

        requiredFields.forEach(field => {
            const newCharacter = {
                user_id: 2,
                name: 'Test character name'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newCharacter[field]

                return supertest(app)
                    .post('/api/characters')
                    .send(newCharacter)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`PATCH /api/characters/:id`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .delete(`/api/characters/${characterId}`)
                    .expect(404, { error: { message: `Character doesn't exist` } })
            })
        })

        context('Given there are characters in the database', () => {
            const testCharacters = makeCharactersArray()

            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })

            it('responds with 204 and updates the character', () => {
                const idToUpdate = 2
                const updateCharacter = {
                    name: 'updated character name',
                }
                const expectedCharacter = {
                    ...testCharacters[idToUpdate - 1],
                    ...updateCharacter
                }
                return supertest(app)
                    .patch(`/api/characters/${idToUpdate}`)
                    .send(updateCharacter)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/characters/${idToUpdate}`)
                            .expect(expectedCharacter)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/characters/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: 'Request body must contain one of: user_id, name'
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateCharacter = {
                    name: 'updated character name',
                }
                const expectedCharacter = {
                    ...testCharacters[idToUpdate - 1],
                    ...updateCharacter
                }

                return supertest(app)
                    .patch(`/api/characters/${idToUpdate}`)
                    .send({
                        ...updateCharacter,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/characters/${idToUpdate}`)
                            .expect(expectedCharacter)
                    )
            })
        })
    })
})