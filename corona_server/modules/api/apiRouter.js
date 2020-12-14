/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */
const Express = require("express");
const o_router = Express.Router();
const ApiCallManager = require("./apiCallManager");

const o_getMatches = require("./routes/getAllMatches");
const o_getMatchById = require("./routes/getMatchById");
const o_getMatchNext = require("./routes/getNextMatch");
const o_postMatch = require("./routes/postMatch");
const o_putMatch = require("./routes/putMatch");
const o_deleteMatch = require("./routes/deleteMatch");


const o_getBookings = require("./routes/getAllBookings");
const o_getBookingsForMatchId = require("./routes/getBookingsForMatch");
const o_postBooking = require("./routes/postBooking");
const o_redeemBooking = require("./routes/redeemBooking");
const o_deleteBookingsOverSaveDuration = require("./routes/deleteBookingsOverSaveDuration");

const o_getRedeemedBookings = require("./routes/getAllRedeemedBookings");
const o_getRedeemedBookingsByMatchId = require("./routes/getRedeemedBookingsForMatch");


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
  req.manager = new ApiCallManager(req, res);
  console.log("CREATE: ", req.manager.getResponseObject());
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
  req.manager.setData("Success").sendResponse();
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

function f_handleUnexpectedErrors(err, req, res, next) {
  console.log("SYSERR: ", req.manager.getResponseObject());
  console.error(err);
  req.manager.setError("SYSERR").sendResponse();
}
//-----------------------------------------------------------------------------------------
// HANDLER =================================================================================================================


// ROUTES ==================================================================================================================


o_router.use(
  // Allow all relevant types of CORS
  f_allowCors,
  // Add custom utilities to Express request Object
  f_appendApiCallManagerToReq,
  // handle Errors during first 2 Steps
  f_handleApiCallManagerErrors,
  // Parse body as json
  Express.json(),
  // handle Parse Errors
  f_handleParseErrors
);


o_router.route("/matches")
  .options(f_handleCorsPrefetchRequests)
  .get(o_getMatches.handleRequest) // Get all natches
  .post(f_requireBasicAuth)
  .post(o_postMatch.handleRequest); // Create a new natch

o_router.route("/nextMatch")
  .options(f_handleCorsPrefetchRequests)
  .get(o_getMatchNext.handleRequest); // Get the next natch that is going to happen

o_router.route("/matches/:id")
  .options(f_handleCorsPrefetchRequests)
  .get(o_getMatchById.handleRequest) // Get match with given id
  .put(f_requireBasicAuth) 
  .put(o_putMatch.handleRequest) // Update match with given id
  .delete(f_requireBasicAuth) 
  .delete(o_deleteMatch.handleRequest);

o_router.route("/matches/:id/redeemedBookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(o_getRedeemedBookingsByMatchId.handleRequest); // Get visitors that checked in for match

o_router.route("/matches/:id/bookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(o_getBookingsForMatchId.handleRequest); // Get bookings for match



o_router.route("/bookings")
  .options(f_handleCorsPrefetchRequests)
  .post(o_postBooking.handleRequest)
  .get(f_requireBasicAuth)
  .get(o_getBookings.handleRequest); // Get all bookings

o_router.route("/bookings/redeem")
  .options(f_handleCorsPrefetchRequests)
  .post(f_requireBasicAuth)
  .post(o_redeemBooking.handleRequest); // Redeem a booking code

o_router.route("/bookings/overdue")
  .options(f_handleCorsPrefetchRequests)
  .delete(f_requireBasicAuth)
  .delete(o_deleteBookingsOverSaveDuration.handleRequest); // Delete booking and visitor data that is old


o_router.route("/redeemedBookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(o_getRedeemedBookings.handleRequest); // get all Visitors that checked in

// Returns 200 when basic auth passes 
o_router.route("/isAdmin")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_return200); // return 200

// Called last ( only if no other route matches)
o_router.use(f_handle404); // return 404
// Called last ( only if error is forwarded)
o_router.use(f_handleUnexpectedErrors); // return 500

module.exports = o_router;