const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures.js')

describe('User Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

    describe(`GET /api/users`, () => {
        context(`Given no users`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, [])
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
            })
        })
    })

    describe(`GET /api/users/:id`, () => {
        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .expect(404, { error: { message: `User doesn't exist` } })
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('responds with 200 and the specified user', () => {
                const userId = 2
                const expectedUser = testUsers[userId - 1]
                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .expect(200, expectedUser)
            })
        })
    })

    describe(`POST /api/users`, () => {
            it(`creates a user, responding with 201 and the new user`, () => {
                const newUser = {
                    username: 'Test new user',
                    password: 'Test password',
                    email_address: 'test@test.com',
                    role: 'player',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.username).to.eql(newUser.username)
                        expect(res.body.password).to.eql(newUser.password)
                        expect(res.body.email_address).to.eql(newUser.email_address)
                        expect(res.body.role).to.eql(newUser.role)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/users/${res.body.id}`)
                            .expect(res.body)
                    )
            })

        const requiredFields = ['username', 'password', 'email_address', 'role']

        requiredFields.forEach(field => {
            const newUser = {
                username: 'Test user name',
                password: 'Test password',
                email_address: 'test@test.com',
                role: 'player'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newUser[field]

                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`PATCH /api/users/:id`, () => {
        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .delete(`/api/users/${userId}`)
                    .expect(404, { error: { message: `User doesn't exist` } })
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('responds with 204 and updates the user', () => {
                const idToUpdate = 2
                const updateUser = {
                    username: 'updated user name',
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }
                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send(updateUser)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .expect(expectedUser)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain one of: 'username', 'password', 'email_address', 'role'`
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateUser = {
                    username: 'updated user name',
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send({
                        ...updateUser,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .expect(expectedUser)
                    )
            })
        })
    })
})