/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */

const o_router = require('express').Router();
const o_test = require('./test');

//--------------------------------------------------
// TODO: Redo Error Handling ?
function f_logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function f_clientErrorHandler(err, req, res, next) {
  res.status(500)
  res.send('Something broke! - (INTERNAL SERVER ERROR)');
}
//-------------------------------------------------



// TODO: Remove before going production
// returns test data for the corresponding id
o_router.get('/test/:testId', o_test.requestHandler);




// Handle internal Server Errors for this router
o_router.use(f_logErrors);
o_router.use(f_clientErrorHandler);


module.exports = o_router;