/**
 * @module apiRouter
 * 
 * Returns the router for the api. Formulates Middleware
 */
const Express = require("express");
const o_router = Express.Router();
const ApiCall = require("./apiCall");

/** Authentification data that is requested when using basic auth*/
var o_auth = { login: 'admin', password: 'Corona187' }

// Api call handler ============================================================================================
// Bookings
const f_deleteBookingsOverSaveDuration = require("./apiCallHandler/bookings/deleteBookingsOverSaveDuration");
const f_getBookings = require("./apiCallHandler/bookings/getBookings");
const f_getBookingsForMatch = require("./apiCallHandler/bookings/getBookingsForMatch");
const f_getBookingsRedeemed = require("./apiCallHandler/bookings/getBookingsRedeemed");
const f_getBookingsRedeemedForMatch = require("./apiCallHandler/bookings/getBookingsRedeemedForMatch");
const f_postBooking = require("./apiCallHandler/bookings/postBooking");
const f_redeemBooking = require("./apiCallHandler/bookings/redeemBooking");
// Matches
const f_deleteMatch = require("./apiCallHandler/matches/deleteMatch");
const f_getMatchById = require("./apiCallHandler/matches/getMatchById");
const f_getMatches = require("./apiCallHandler/matches/getMatches");
const f_getMatchNext = require("./apiCallHandler/matches/getMatchNext");
const f_postMatch = require("./apiCallHandler/matches/postMatch");
const f_putMatch = require("./apiCallHandler/matches/putMatch");
//==============================================================================================================


// Middleware =================================================================================================================

/**
 * Middleware to be used by the express Framework.
 * Request that are routed through this middleware require basicAuth or will return a "not authorized response"
 */
function f_requireBasicAuth(req, res, next) {

  // parse login and password from headers
  const s_authHeader = req.headers.authorization || '' // If no header is set, create an empty one
  const b64auth = s_authHeader.split(' ')[1] || '' // Tries to return what behind the "Base " part of the auth Header, if it fails -> empty string
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':') // Convert from base64 to string

  // Verify login and password are set and correct
  if (login && password && login === o_auth.login && password === o_auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  req.apiCall.setError("NOAUTH").sendResponse();
}

/**
 * Middleware to be used by the express Framework.
 * Attach an instance of the ApiCall class to the request object.
 */
function f_appendApiCallManagerToReq(req, res, next) {
  req.apiCall = new ApiCall(req, res);
  console.log("CREATE: ", req.apiCall.getCallData());
  next();
}

/**
 * Middleware to be used by the express Framework.
 * Send an error manually in case a ApiCall can not be attached to a request
 */
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

/**
 * Wrapps an apiCallHandler as express middleware to be used by the express Framework.
 * @param {function} handler - A apiCallHandler, is expected to take apiCall as parameter and always call the sendResponse() function of the apiCall to end it.
 * @returns express middleware wrapping the handler: function (req, res, next){}
 */
function f_callApiCallHandler(handler) {
  return async function (req, res, next) {
    try {
      await handler(req.apiCall);
    }
    catch (error) {
      console.log("SYSERR: ", req.apiCall.getCallData());
      console.error(error);
      req.apiCall.setError("SYSERR").sendResponse();
    }
  }
}

// Error Handling Middleware ===========================================================================
/**
 * Middleware to be used by the express Framework.
 * Send Parse error response if an error is caught.
 */
function f_handleParseErrors(err, req, res, next) {
  req.apiCall.setError("JSONPARSE").sendResponse();
}

/**
 * Middleware to be used by the express Framework.
 * Send 404 error response if an error is caught.
 */
function f_handle404(req, res, next) {
  req.apiCall.setError("NOROUTE").sendResponse();
}

/**
 * Middleware to be used by the express Framework.
 * Send 200 response.
 */
function f_return200(req, res, next) {
  req.apiCall.setData("Success").sendResponse();
}


// ROUTES ==================================================================================================================

//Applied on all routes
o_router.use(
  // Add custom utilities to Express request Object
  f_appendApiCallManagerToReq,
  // handle Errors without using the apiCallManager
  f_handleApiCallManagerErrors,
  // Parse body as json
  Express.json(),
  // handle Parse Errors
  f_handleParseErrors
);


o_router.route("/matches")
  .get(f_callApiCallHandler(f_getMatches)) // Get all matches
  .post(f_requireBasicAuth)
  .post(f_callApiCallHandler(f_postMatch)); // Create a new natch

o_router.route("/nextMatch")
  .get(f_callApiCallHandler(f_getMatchNext)); // Get the next natch that is going to happen

o_router.route("/matches/:id")
  .get(f_callApiCallHandler(f_getMatchById)) // Get match with given id
  .put(f_requireBasicAuth)
  .put(f_callApiCallHandler(f_putMatch)) // Update match with given id
  .delete(f_requireBasicAuth)
  .delete(f_callApiCallHandler(f_deleteMatch)); // Delete match with given id

o_router.route("/matches/:id/redeemedBookings")
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsRedeemedForMatch)); // Get redeemed bookings for match

o_router.route("/matches/:id/bookings")
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsForMatch)); // Get bookings for match



o_router.route("/bookings")
  .post(f_callApiCallHandler(f_postBooking)) // Post a booking
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookings)); // Get all bookings

o_router.route("/bookings/redeem")
  .post(f_requireBasicAuth)
  .post(f_callApiCallHandler(f_redeemBooking)); // Redeem a booking code

o_router.route("/bookings/overdue")
  .delete(f_requireBasicAuth)
  .delete(f_callApiCallHandler(f_deleteBookingsOverSaveDuration)); // Delete booking and visitor data that is old


o_router.route("/redeemedBookings")
  .get(f_requireBasicAuth)
  .get(f_callApiCallHandler(f_getBookingsRedeemed)); // get all redeemed Bookings

// Returns 200 when basic auth passes 
o_router.route("/isAdmin")
  .get(f_requireBasicAuth)
  .get(f_return200); // return 200

// Called last ( only if no other route matches)
o_router.use(f_handle404); // return 404

module.exports = o_router;