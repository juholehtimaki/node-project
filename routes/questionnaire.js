'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: false });

const router = express.Router();
const QuestionnaireController = require('../controllers/questionnaire');

router.use(auth.ensureTeacher);

// View documents
router.get('/', csrfProtection, QuestionnaireController.listQuestionnaires);
router.get('/:id([a-f0-9]{24})', QuestionnaireController.showQuestionnaire);

// Create documents
router.get('/new', QuestionnaireController.createQuestionnaire);
router.post('/new', QuestionnaireController.processUpdate);

// Update documents
router.post('/edit/:id([a-f0-9]{24})', QuestionnaireController.processUpdate);

// Delete documents
router.post('/delete/:id([a-f0-9]{24})', QuestionnaireController.processDelete);

module.exports = router;