/* eslint-disable babel/no-invalid-this */
'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const mongoose = require('mongoose');

const app = require('../../app');
const expect = chai.expect;
chai.use(chaiHttp);

const admin = config.get('admin');
const loginUrl = '/users/login';
const registerUrl = '/users/register';

describe('/users', function() {
    let request;

    
    after(function(done) {
        mongoose.disconnect(done);
    });

    this.beforeAll(function(done) {
        request = chai.request.agent(app);
        done();
    });



    describe('/register', function() {
        let payload;
        let payload2;

        beforeEach(function() {
            payload = {
                name: 'user',
                email: 'user@sposti.fi',
                password: '1234567890',
                passwordConfirmation: '1234567890'
            };
            const uniq = Math.floor(Math.random() * 1000000000);
            payload2 = {
                name: `user${uniq}`,
                email: `user${uniq}@sposti.fi`,
                password: '1234567890',
                passwordConfirmation: '1234567890'
            };
        });

        it('should register successfully a correct user', async function() {
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload2);
            expect(response.statusCode).to.equal(200);
        });

        it('should prevent from registering the same user once again', async function() {
            let response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload2);
            response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload2);
            expect(response.statusCode).to.equal(409);
        });

        it('should fail registeration due to a missing email', async function() {
            delete payload.email;
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });

        it('should not accept registration with illegal email', async function() {
            payload.email = 'wrong-wrong';
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });

        it('should not accept registration with missing password', async function() {
            delete payload.password;
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });

        it('should not accept registration with too short password', async function() {
            payload.email = '1';
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });

        it('should not accept registration with missing password confirmation', async function() {
            delete payload.passwordConfirmation;
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });

        it('should not accept registration with different password and confirmation', async function() {
            payload.passwordConfirmation = `${payload.password}sdfjkhasjkhf`;
            const response = await request
                .post(registerUrl)
                // .type('form')
                .type('json')
                .send(payload);
            expect(response.statusCode).to.equal(400);
        });
    });

    describe('/login', function() {
        let payload;

        beforeEach(function() {
            payload = {
                email: 'user@sposti.fi',
                password: '1234567890'
            };
        });

        it('should not accept login with missing email', async function() {
            delete payload.email;
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with illegal email', async function() {
            payload.email = 'user@sposti';
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with wrong email', async function() {
            payload.email = 'admin@sposti.net';
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with missing password', async function() {
            delete payload.password;
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should not accept login with wrong password', async function() {
            payload.password = '0987654321';
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(payload);
            expect(response).to.redirectTo(/\/users\/login$/);
        });

        it('should accept login with correct credentials', async function() {
            const response = await request
                .post(loginUrl)
                .type('form')
                .send(admin);
            expect(response).to.have.cookie('bwa');
            expect(response).to.redirectTo(/\/users\/me$/);
        });

        it('should redirect to /users/me if already logged in', async function() {
            // log in
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(admin);
            expect(response).to.have.cookie('bwa');
            expect(response).to.redirectTo(/\/users\/me$/);

            // already logged in
            response = await request.get(loginUrl);
            expect(response).to.redirectTo(/\/users\/me$/);
        });
    });
});
