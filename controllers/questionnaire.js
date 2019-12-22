'use strict';

const Questionnaire = require('../models/questionnaire')

module.exports = {
    /**
     * Lists all questionnaires
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    listQuestionnaires(request, response) {
        Questionnaire.find().exec()
            .then(function (questionnaires) {
                response.render('management/listQuestionnaires', {
                    questionnaireList: questionnaires
                });
            })
            .catch(error => {
                console.log(error);
                response.render('error', { error })
            });
    },

    /**
     * Shows a single questionnaire
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    showQuestionnaire(request, response) {
        Questionnaire.findOne({ _id: request.params.id }).exec()
            .then(function (questionnaire) {
                if (!questionnaire)
                    response.render('management/showMessage', { message: 'Questionnaire not found.' });
                else
                    response.render('management/showQuestionnaire', questionnaire);
            })
            .catch(error => {
                console.log(error);
                response.render('error', { error });
            });
    },

    /**
     * Show page to create a new questionnaire
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    createQuestionnaire(request, response) {
        let questionnaire = {
            _id: '',
            title: 'Untitled questionnaire',
            submissions: 2,
            questions: [
                {
                    title: '',
                    maxPoints: 2,
                    options: [
                        {
                            option: '',
                            hint: '',
                            correctness: false
                        },
                        {
                            option: '',
                            hint: '',
                            correctness: false
                        }
                    ]
                }
            ]
        };
        response.render('management/showQuestionnaire', questionnaire);
    },

    /**
     * Process a POST request for questionnaire update or creation
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    processUpdate(request, response) {
        if (!request.params.id) {
            delete request.body._id;
            new Questionnaire(request.body).save()
                .then(() => response.redirect('/questionnaires/'))
                .catch((error) => {
                    response.status(400);
                    response.render('flash-error', { message: error.message, layout: false });
                });
        } else {
            delete request.body._id;
            Questionnaire.findOneAndUpdate({ _id: request.params.id }, request.body, {
                runValidators: true,
                setDefaultsOnInsert: true,
                context: 'query'
            })
                .then(() => response.redirect('/questionnaires/'))
                .catch((error) => {
                    response.status(400);
                    response.render('flash-error', { message: error.message, layout: false });
                });
        }
    },

    /**
     * Process a POST request for questionnaire deletion
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    processDelete(request, response) {
        Questionnaire.deleteOne({ _id: request.params.id })
            .then(() => {
                response.redirect('/questionnaires/')
            })
            .catch((error) => {
                console.log(error);
                response.status(400);
                response.render('flash-error', { message: error.message, layout: false });
            });
    }
};
