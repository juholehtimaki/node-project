/* eslint-disable babel/no-invalid-this */
'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Questionnaire = require('../../models/questionnaire.js');
const app = require('../../app');
const expect = chai.expect;
chai.use(chaiHttp);

const admin = config.get('admin');
const loginUrl = '/users/login';

let testQuestionnaire1 = {
    title: 'Untitled questionnaire1',
    submissions: 2,
    questions: [
        {
            title: 'test question1',
            maxPoints: 2,
            options: [
                {
                    option: 'xd1',
                    hint: '',
                    correctness: true
                },
                {
                    option: 'xd2',
                    hint: '',
                    correctness: false
                }
            ]
        }
    ]
};

let testQuestionnaire2 = {
    title: 'Untitled questionnaire2',
    submissions: 2,
    questions: [
        {
            title: 'test question2',
            maxPoints: 2,
            options: [
                {
                    option: 'xd1',
                    hint: '',
                    correctness: true
                },
                {
                    option: 'xd2',
                    hint: '',
                    correctness: false
                }
            ]
        }
    ]
};

let testQuestionnaire3 = {
    title: 'Untitled questionnaire3',
    submissions: 2,
    questions: [
        {
            title: 'test question3',
            maxPoints: 2,
            options: [
                {
                    option: 'xd1',
                    hint: '',
                    correctness: true
                },
                {
                    option: 'xd2',
                    hint: '',
                    correctness: false
                }
            ]
        }
    ]
};

describe('Games', function() {
    let request;

    this.beforeAll(function(done) {
        request = chai.request.agent(app);
        done();
    });

    after(function(done) {
        Questionnaire.deleteMany({}).exec();
        done();
    });

    this.afterAll(function(done) {
        request.close();
        done();
    });

    describe('Games', function() {
        it('/games/ - Should list all available games (questionnaires)', async function() {
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(admin);
            response = await request
                .post(loginUrl)
                .type('form')
                .send(admin);
            await Questionnaire.deleteMany({}).exec();
            await new Questionnaire(testQuestionnaire1).save();
            response = await request.get('/games/').send();
            let $ = cheerio.load(response.text);
            let result = await Questionnaire.find().exec();
            expect($('.questionnaire').length).to.equal(result.length);
        });

        it('/games/ - Should list all avaible games after adding a new questionnaire', async function() {
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(admin)
                .then(Questionnaire.deleteMany({}).exec())
                .then(new Questionnaire(testQuestionnaire1).save());
            response = await request.get('/games/').send();
            let $ = cheerio.load(response.text);
            let resultCount1 = $('.questionnaire').length;
            await new Questionnaire(testQuestionnaire2).save();
            response = await request.get('/games/').send();
            $ = cheerio.load(response.text);
            let resultCount2 = $('.questionnaire').length;
            expect(resultCount1 + 1).to.equal(resultCount2);
        });

        it('/games/ - Should list all available games after deleting one questionnaire', async function() {
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(admin)
                .then(Questionnaire.deleteMany({}).exec())
                .then(new Questionnaire(testQuestionnaire1).save());
            response = await request.get('/games/').send();
            let $ = cheerio.load(response.text);
            let resultCount1 = $('.questionnaire').length;
            let first = await Questionnaire.findOne().exec();
            let firstId = first._id;
            response = await request
                .post('/questionnaires/delete/' + firstId)
                .type('json')
                .send();
            response = await request.get('/games/').send();
            $ = cheerio.load(response.text);
            let resultCount2 = $('.questionnaire').length;
            expect(resultCount1 - 1).to.equal(resultCount2);
        });

        it('/games/id - Should open a game view with valid questionnaire ID', async function() {
            let response = await request
                .post(loginUrl)
                .type('form')
                .send(admin)
                .then(Questionnaire.deleteMany({}).exec())
                .then(new Questionnaire(testQuestionnaire1).save());
            let first = await Questionnaire.findOne().exec();
            let firstId = first._id;
            response = await request.get('/games/' + firstId).send();
            let $ = cheerio.load(response.text);
            let resultCount = $('#exercise').length;
            expect(resultCount).to.equal(1);
        });

        it('/games/id - Testing a game view with invalid game ID', async function() {
            let response = await request
                .get('/games/' + '1234567890aaaaaaaaaaaaaa')
                .send();
            expect(response.statusCode).to.equal(404);
        });
    });
});
