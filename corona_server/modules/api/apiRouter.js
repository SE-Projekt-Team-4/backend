/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */
const Express = require("express");
const o_router = Express.Router();
const ApiCall = require("./apiCall");

const f_getMatches = require("./apiCallHandler/matches/getMatches");
const f_getMatchById = require("./apiCallHandler/matches/getMatchById");
const f_getMatchNext = require("./apiCallHandler/matches/getMatchNext");
const f_postMatch = require("./apiCallHandler/matches/postMatch");
const f_putMatch = require("./apiCallHandler/matches/putMatch");
const f_deleteMatch = require("./apiCallHandler/matches/deleteMatch");


const f_getBookings = require("./apiCallHandler/bookings/getBookings");
const f_getBookingsForMatch = require("./apiCallHandler/bookings/getBookingsForMatch");
const f_postBooking = require("./apiCallHandler/bookings/postBooking");
const f_redeemBooking = require("./apiCallHandler/bookings/redeemBooking");
const f_deleteBookingsOverSaveDuration = require("./apiCallHandler/bookings/deleteBookingsOverSaveDuration");
const f_getBookingsRedeemed = require("./apiCallHandler/bookings/getRedeemedBookings");
const f_getBookingsRedeemedByMatch = require("./apiCallHandler/bookings/getRedeemedBookingsForMatch");


// HANDLER =================================================================================================================
function f_requireBasicAuth(req, res, next) {
  // authentication middleware

  const auth = { login: 'admin', password: 'Corona187' } // change this

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
  req.manager = new ApiCall(req, res);
  console.log("CREATE: ", req.manager.getCallData());
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

function f_callApiCallHandler(handler) {
  return async function (req, res, next) {
    try {
      await handler(req.manager);
    }
    catch (error) {
      console.log("SYSERR: ", req.manager.getCallData());
      console.error(error);
      req.manager.setError("SYSERR").sendResponse();
    }
  }
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
  .get(f_callApiCallHandler(f_getMatches)) // Get all natches
  .post(f_requireBasicAuth)
  .post(f_callApiCallHandler(f_postMatch)); // Create a new natch

o_router.route("/nextMatch")
  .options(f_handleCorsPrefetchRequests)
  .get(f_callApiCallHandler(f_getMatchNext)); // Get the next natch that is going to happen

o_router.route("/matches/:id")
  .options(f_handleCorsPrefetchRequests)
  .get(f_callApiCallHandler(f_getMatchNext)) // Get match with given id
  .put(f_requireBasicAuth)
  .put(f_callApiCallHandler(f_putMatch)) // Update match with given id
  .delete(f_requireBasicAuth)
  .delete(f_callApiCallHandler(f_deleteMatch)); // Delete match with given id

o_router.route("/matches/:id/redeemedBookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsRedeemedByMatch)); // Get redeemed bookings for match

o_router.route("/matches/:id/bookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsForMatch)); // Get bookings for match



o_router.route("/bookings")
  .options(f_handleCorsPrefetchRequests)
  .post(f_callApiCallHandler(f_postBooking)) // Post a booking
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookings)); // Get all bookings

o_router.route("/bookings/redeem")
  .options(f_handleCorsPrefetchRequests)
  .post(f_requireBasicAuth)
  .post(f_callApiCallHandler(f_redeemBooking)); // Redeem a booking code

o_router.route("/bookings/overdue")
  .options(f_handleCorsPrefetchRequests)
  .delete(f_requireBasicAuth)
  .delete(f_callApiCallHandler(f_deleteBookingsOverSaveDuration)); // Delete booking and visitor data that is old


o_router.route("/redeemedBookings")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsRedeemed)); // get all redeemed Bookings

// Returns 200 when basic auth passes 
o_router.route("/isAdmin")
  .options(f_handleCorsPrefetchRequests)
  .get(f_requireBasicAuth)
  .get(f_return200); // return 200

// Called last ( only if no other route matches)
o_router.use(f_handle404); // return 404

module.exports = o_router;