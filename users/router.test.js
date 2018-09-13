'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app } = require('../index');
const User = require('./models');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');
const seedUsers = require('../db/users');


chai.use(chaiHttp);
const expect = chai.expect;
let token;
let user;


describe('Hablamos API - Users', function () {
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';

    before(function () {
        return mongoose.connect(TEST_DATABASE_URL)
            .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return Promise.all([
            User.insertMany(seedUsers),
            User.createIndexes()
        ])
            .then(([users]) => {
                user = users[0];
                token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
            })
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('/api/users', function () {
        describe('POST', function () {
            it('Should reject users with missing username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        password,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(`Missing 'username' in request body`);
                    });
            });
            it('Should reject users with missing password', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(`Missing 'password' in request body`);
                    });
            });
            it('Should reject users with non-string username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username: 1234,
                        password,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Incorrect field type: expected string`
                        );
                    });
            });
            it('Should reject users with non-string password', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password: 1234,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Incorrect field type: expected string`
                        );
                    });
            });
            it('Should reject users with non-trimmed username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username: ` ${username} `,
                        password,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Cannot start or end with whitespace`
                        );
                    });
            });
            it('Should reject users with non-trimmed password', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password: ` ${password} `,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Cannot start or end with whitespace`
                        );
                    });
            });
            it('Should reject users with empty username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username: '',
                        password,
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Must be at least 1 characters long`
                        );
                    });
            });
            it('Should reject users with password less than 8 characters', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password: '1234567',
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Must be at least 8 characters long`
                        );
                    });
            });
            it('Should reject users with password greater than 72 characters', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password: new Array(73).fill('a').join(''),
                        firstName,
                        lastName
                    })
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            `Must be at most 72 characters long`
                        );
                    });
            });
            it('Should reject users with duplicate username', function () {
                // Create an initial user
                return User.create({
                    username,
                    password,
                    firstName,
                    lastName
                })
                    .then(() =>
                        // Try to create a second user with the same username
                        chai.request(app).post('/api/users').send({
                            username,
                            password,
                            firstName,
                            lastName
                        })
                    )
                    .then((res) => {
                        expect(res).to.have.status(422);
                        expect(res.body.message).to.equal(
                            'Username already taken'
                        );
                    });
            });
            it('Should create a new user', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password,
                        firstName,
                        lastName
                    })
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.keys(
                            'username',
                            'firstName',
                            'lastName',
                            '_id',
                            'questionsAnswered',
                            'questionsCorrect'
                        );
                        expect(res.body.username).to.equal(username);
                        expect(res.body.firstName).to.equal(firstName);
                        expect(res.body.lastName).to.equal(lastName)
                        return User.findOne({
                            username
                        });
                    })
                    .then(user => {
                        expect(user).to.not.be.null;
                        expect(user.firstName).to.equal(firstName);
                        return user.validatePassword(password);
                    })
                    .then(passwordIsCorrect => {
                        expect(passwordIsCorrect).to.be.true;
                    });
            });
            it('Should trim firstName', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password,
                        firstName: ` ${firstName} `,
                        lastName,
                    })
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.keys(
                            'username',
                            'firstName',
                            'lastName',
                            '_id',
                            'questionsAnswered',
                            'questionsCorrect'
                        );
                        expect(res.body.username).to.equal(username);
                        expect(res.body.firstName).to.equal(firstName);
                        return User.findOne({
                            username
                        });
                    })
                    .then(user => {
                        expect(user).to.not.be.null;
                        expect(user.firstName).to.equal(firstName);
                    });
            });
            it('Should trim lastName', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password,
                        lastName: ` ${lastName} `,
                        firstName
                    })
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.keys(
                            'username',
                            'lastName',
                            'firstName',
                            '_id',
                            'questionsAnswered',
                            'questionsCorrect'
                        );
                        expect(res.body.username).to.equal(username);
                        expect(res.body.lastName).to.equal(lastName);
                        return User.findOne({
                            username
                        });
                    })
                    .then(user => {
                        expect(user).to.not.be.null;
                        expect(user.lastName).to.equal(lastName);
                    });
            });
        });
    });
    describe('GET/:id', function() {
        it('Should return the first question in line', function() {
            return User.findOne()
                .then(user => {
                    return chai
                        .request(app)
                        .get(`/api/users/${user._id}`)
                        .set('Authorization', `Bearer ${token}`)
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys(
                        'firstQuestion',
                        'questions'
                    );
                    expect(res.body.questions).to.be.an('array')
                })
        })
        it('Should return an error when given bad ID', function() {
            return chai
                .request(app)
                .get('/api/users/users/1234456')
                .set('Authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(404)
                });
        })
        it('Should return an error without proper JWT', function() {
            return User.findOne()
                .then(user => {
                    return chai
                        .request(app)
                        .get(`/api/users/${user._id}`)
                })
                .then(res => {
                    expect(res).to.have.status(401)
                });
        })
    })
    describe('PUT /:id', function () {
        it('Should update the list and return correct feedback', function() {
            return User.findOne()
                .then(user => {
                    return chai
                        .request(app)
                        .put(`/api/users/${user._id}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({userAnswer: 'peanuts'})
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys(
                        'feedback',
                        'correctAnswer',
                        'questionsAnswered',
                        'questionsCorrect'
                    );
                })
        })
        it('Should return 400 if request missing a userAnswer', function() {
            return User.findOne()
                .then(user => {
                    return chai
                        .request(app)
                        .put(`/api/users/${user._id}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send()
                })
                .then(res => {
                    expect(res).to.have.status(400);
                })
        })
        it('Should return an error without proper JWT', function() {
            return User.findOne()
                .then(user => {
                    return chai
                        .request(app)
                        .get(`/api/users/${user._id}`)
                })
                .then(res => {
                    expect(res).to.have.status(401)
                });
        })
    })
});

