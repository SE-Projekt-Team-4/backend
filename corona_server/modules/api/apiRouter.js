/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */
const Express = require("express");
const o_router = Express.Router();
const o_test = require("./test");
const o_allMatches = require("./routes/getAllMatches");
const o_matchById = require("./routes/getMatchById");
const o_postBooking = require("./routes/postBooking");
const ApiCallData = require("./apiCallManager");

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

function f_handleApiCallManagerErrors(err, req, res, next) {
  console.error(err);
  res.status(500);
  res.json({
    error : {
      errorCode : "CRITICAL",
      status : 500,
      message : "If this error persists, please contact the server admin"
    }
  });
}
//-----------------------------------------------------------------------------------------


o_router.use(
  f_appendApiCallManagerToReq,
  f_handleApiCallManagerErrors,
  Express.json(),
  f_handleParseErrors
);

//o_router.get("/test/:testId", o_test.requestHandler);

o_router.get("/matches", o_allMatches.handleRequest);

o_router.get("/matches/:id", o_matchById.handleRequest);

o_router.post("/bookings", o_postBooking.handleRequest);

// Called last ( only if no other route matches)
o_router.use(f_handle404);

module.exports = o_router;