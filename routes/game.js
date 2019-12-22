'use strict';

const express = require('express');
const router = express.Router();
const GameController = require('../controllers/game');
const auth = require('../middleware/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: false });

router.use(auth.ensureStudent);

//Get request for all games
router.get('/', csrfProtection, GameController.showGames);

//Get request for questionnaire game
router.get('/:id([a-f0-9]{24})', GameController.showGame);

//Post request for grading
router.post('/:id([a-f0-9]{24})', GameController.gradeExercise);

module.exports = router;