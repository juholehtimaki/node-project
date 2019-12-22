'use strict';

const Questionnaire = require('../models/questionnaire');

module.exports = {
    /**
     * Renders the questionnaire in game format
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    showGame(request, response) {
        Questionnaire.findOne({ _id: request.params.id })
            .exec()
            .then((result) => {
                if (result) {
                    response.render('game/gameView', {
                        questionnaireString: JSON.stringify(result)
                    });
                } else {
                    response.status(404);
                    response.render('management/showMessage', {
                        message: 'Questionnaire for the game not found.'
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                response.render('error', { error });
            });
    },

    /**
     * Shows a view of available games
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    showGames(request, response) {
        Questionnaire.find()
            .exec()
            .then(function(questionnaires) {
                response.render('game/showGames', {
                    questionnaireList: questionnaires
                });
            })
            .catch((error) => {
                console.log(error);
                response.render('error', { error });
            });
    },

    /**
     * Post handler for grading (game results)
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    gradeExercise(request, response) {
        Questionnaire.findOne({ _id: request.params.id })
            .exec()
            .then((result) => {
                if (result) {
                    let points = 0;
                    let maxPoints = 0;
                    let answers = request.body.answers;
                    for (let q of result.questions) {
                        let correctAnswers = 0;
                        let totalAnswers = 0;
                        let wrongAnswers = 0;
                        let qMaxPoints = q.maxPoints;
                        maxPoints += qMaxPoints;
                        let iterAnswers = answers[q._id];
                        for (let opt of q.options) {
                            totalAnswers++;
                            if (
                                iterAnswers &&
                                iterAnswers.filter((a) => a === opt._id)
                                    .length > 0
                            ) {
                                if (opt.correctness) {
                                    correctAnswers++;
                                } else {
                                    wrongAnswer++;
                                }
                            } else {
                                if (!opt.correctness) {
                                    correctAnswers++;
                                }
                            }
                        }
                        points += (correctAnswers / totalAnswers) * qMaxPoints;
                    }
                    let roundedPoints = Math.round(points * 10) / 10;
                    let resultObject = {
                        points: roundedPoints,
                        maxPoints: maxPoints,
                        status: 'graded',
                        description:
                            'minimal viable grader in the express framework',
                        title: 'A+ greetings',
                        isGradeResponse: true
                    };
                    response.render('game/gameGraded', resultObject);
                } else {
                    response.status(400);
                    response.render('management/showMessage', {
                        message: 'Questionnaire for the game not found.'
                    });
                }
            })
            .catch((error) => {
                response.status(500);
                response.render('error', { error });
            });
    }
};
