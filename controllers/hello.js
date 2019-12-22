'use strict';

/**
 * Shows the welcome screen
 * @param {Object} request is express request object
 * @param {Object} response is express response object
 */

module.exports = {
    helloPage(request, response) {
        response.render('hello');
    }
};
