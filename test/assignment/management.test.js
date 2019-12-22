/* eslint-disable babel/no-invalid-this */
'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const cheerio = require('cheerio');
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

describe('Management', function() {
    let request = chai.request.agent(app);

    before(function() {
        return request
            .post(loginUrl)
            .type('form')
            .send(admin)
            .then((response) => {
                Questionnaire.deleteMany({}).exec();
                return new Questionnaire(testQuestionnaire1).save();
            });
    });

    after(function(done) {
        request.close();
        done();
    });

    describe('Questionnaire management', function() {
        it('/questionnaires/ - Should list all available questionnaires', async function() {
            const response = await request.get('/questionnaires/').send();
            let $ = cheerio.load(response.text);
            let result = await Questionnaire.find().exec();
            expect($('.questionnaire').length).to.equal(result.length);
        });

        it('/questionnaires/ - Should list one more questionnaire after adding one', async function() {
            let response = await request.get('/questionnaires/').send();
            let $ = cheerio.load(response.text);
            let resultCount1 = $('.questionnaire').length;
            await new Questionnaire(testQuestionnaire2).save();
            response = await request.get('/questionnaires/').send();
            $ = cheerio.load(response.text);
            let resultCount2 = $('.questionnaire').length;
            expect(resultCount1 + 1).to.equal(resultCount2);
        });

        it('/questionnaires/new/ - Adding new questionnaire', async function() {
            let response = await request.get('/questionnaires/').send();
            let $ = cheerio.load(response.text);
            let resultCount1 = $('.questionnaire').length;
            response = await request
                .post('/questionnaires/new/')
                .type('json')
                .send(testQuestionnaire3);
            response = await request.get('/questionnaires/').send();
            $ = cheerio.load(response.text);
            let resultCount2 = $('.questionnaire').length;
            expect(resultCount1 + 1).to.equal(resultCount2);
        });

        it('/questionnaires/delete/ - Deleting a questionnaire', async function() {
            let result = await Questionnaire.find().exec();
            let resultCount1 = result.length;
            let first = await Questionnaire.findOne().exec();
            let firstId = first._id;

            let response = await request
                .post('/questionnaires/delete/' + firstId)
                .type('json')
                .send();

            result = await Questionnaire.find().exec();
            let resultCount2 = result.length;

            expect(resultCount1 - 1).to.equal(resultCount2);
        });

        it('/questionnaires/edit/ - Editing a questionnaire', async function() {
            let first = await Questionnaire.findOne().exec();
            let firstId = first._id;

            let newTitle = 'EditedTitleTest';
            first.title = newTitle;
            let response = await request
                .post('/questionnaires/edit/' + firstId)
                .type('json')
                .send(first);

            let edited = await Questionnaire.findOne({ _id: firstId }).exec();
            let editedTitle = edited.title;

            expect(editedTitle).to.equal(newTitle);
        });

        it('/questionnaires/edit/ - Editing a questionnaire with wrong id', async function() {
            let first = await Questionnaire.findOne().exec();
            let newTitle = 'EditedTitleTest';
            first.title = newTitle;

            let response = await request
                .post('/questionnaires/edit/' + '1234567890aaaaaaaaaaaaaa')
                .type('json')
                .send(first);

            expect(response.statusCode).to.equal(400);
        });
    });
});
