/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */
const Express = require("express");
const o_router = Express.Router();
const o_allMatches = require("./routes/getAllMatches");
const o_matchById = require("./routes/getMatchById");
const o_postBooking = require("./routes/postBooking");
const o_postMatch = require("./routes/postMatch");
const o_allVisitors = require("./routes/getAllVisitors");
const o_visitorsByMatchId = require("./routes/getVisitorsForMatches");
const o_putMatch = require("./routes/putMatch");
const o_redeemBooking = require("./routes/redeemBooking");
const o_deleteBookingsOverSaveDuration = require("./routes/deleteBookingsOverSaveDuration");
const o_nextMatch = require("./routes/getNextMatch");
const ApiCallData = require("./apiCallManager");

// HANDLER =================================================================================================================
function f_requireBasicAuth(req, res, next) {
  // authentication middleware

  const auth = {login: 'admin', password: 'Corona187'} // change this

  // parse login and password from headers
  const s_authHeader = req.headers.authorization || '' // If no header is set, create an empty one
  const b64auth = s_authHeader.split(' ')[1] || '' // Tries to return what behind the "Base " part of the auth Header, if it fails -> empty string
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':') // Convert from base64 to string

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  req.manager.setError("NOAUTH").sendResponse();

}


function f_allowCors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Request-Method", "POST, GET, OPTIONS, PUT, DELETE");  // for now we will act as if we allow all methods
  next();
}

function f_handleCorsPrefetchRequests(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Request-Method", "POST, GET, OPTIONS, PUT, DELETE");  // for now we will act as if we allow all methods
  res.sendStatus(200);
}

// Modify ExpressRequest to inlcude a custom Manager for easier Management of Api
function f_appendApiCallManagerToReq(req, res, next) {
  req.manager = new ApiCallData(req, res);
  console.log(req.manager._callData);
  next();
}

// Handle Errors that can not be handled in routes -------------------------------
function f_handleParseErrors(err, req, res, next) {
  req.manager.setError("JSONPARSE").sendResponse();
}

function f_handle404(req, res, next) {
  req.manager.setError("NOROUTE").sendResponse();
}

function f_return200(req, res, next) {
  req.manager.setData("Credentials are correct!").sendResponse();
}

function f_handleApiCallManagerErrors(err, req, res, next) {
  console.error(err);
  res.status(500);
  res.json({
    error: {
      errorCode: "CRITICAL",
      status: 500,
      message: "If this error persists, please contact the server admin"
    }
  });
}
//-----------------------------------------------------------------------------------------
// HANDLER =================================================================================================================


// ROUTES ==================================================================================================================

// Add CORS headers and answer PreflightRequests
o_router.use(
  f_allowCors,
  f_appendApiCallManagerToReq,
  f_handleApiCallManagerErrors,
  Express.json(),
  f_handleParseErrors
);


o_router.route("/matches")
  .options(f_handleCorsPrefetchRequests)
  .get(o_allMatches.handleRequest)
  .post(f_requireBasicAuth)
  .post(o_postMatch.handleRequest);

o_router.route("/visitors")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(o_allVisitors.handleRequest);

o_router.route("/matches/:id")
  .options(f_handleCorsPrefetchRequests)
  .get(o_matchById.handleRequest)
  .put(o_putMatch.handleRequest);

o_router.route("/nextMatch")
  .options(f_handleCorsPrefetchRequests)
  .get(o_nextMatch.handleRequest);

o_router.route("/matches/:id/visitors")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(o_visitorsByMatchId.handleRequest);

o_router.route("/isAdmin")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_return200);

o_router.route("/bookings")
  .options(f_handleCorsPrefetchRequests)
  .post(o_postBooking.handleRequest);

o_router.route("/bookings/redeem")
  .options(f_handleCorsPrefetchRequests)
  .post(f_requireBasicAuth)
  .post(o_redeemBooking.handleRequest);

o_router.route("/bookings/overdue")
  .options(f_handleCorsPrefetchRequests)
  .delete(f_requireBasicAuth)
  .delete(o_deleteBookingsOverSaveDuration.handleRequest);

// Called last ( only if no other route matches)
o_router.use(f_handle404);

module.exports = o_router;