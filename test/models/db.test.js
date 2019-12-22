/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
'use strict';

// NPM install mongoose and chai. Make sure mocha is globally
// installed
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const config = require('config');

describe('Config', function() {

    this.afterAll(function(done){
      done();
    });

    describe('mongo config', function() {
        it('must have mongo key', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig).to.exist;
        });
        it('must have a JSON object as a value', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig).to.be.an('object');
        });
        it('must define keys host, port, and db in the JSON object', function() {
            const mongoConfig = config.mongo;
            expect(mongoConfig.host).to.exist;
            expect(mongoConfig.port).to.exist;
            expect(mongoConfig.db).to.exist;
        });
    });

    describe('db connection', function() {
        // let db;
        // let mongoConfig;

        it('must be able to store data', async function() {
            const dbConfig = config.get('mongo');
            // connect to database
            const db = require('../../models/db');
            db.connectDB(dbConfig);

            // const number=2;
            const rawData = fs.readFileSync(
                path.resolve(__dirname, '../../setup/game.questionnaire.json')
            );
            const data = JSON.parse(rawData);
            const Questionnaire = require('../../models/questionnaire');

            // delete old entries and from the database
            await Questionnaire.deleteMany({}); //TODO - reconsider
            // then add sample data to database
            //TODO: ask the count before and after, the delta should be NUMBER_OF_QUESTIONS
            await Questionnaire.create(data);

            db.disconnectDB();
        });
    });
});
