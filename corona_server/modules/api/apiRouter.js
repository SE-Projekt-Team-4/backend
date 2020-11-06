/**
 * @file This module defines the express router that exposes all urls for the api
 * @version 0.0.1
 */
const Express = require("express");
const o_router = Express.Router();
const o_test = require("./test");
const o_allMatches = require("./getAllMatches");
const o_matchById = require("./getMatchById");
const o_postBooking = require("./postBooking");


function f_handleParseErrors(err, req, res, next) {

  res.status(400);
  res.json({ error : "Not a valid Request Body! Json parse Error" });
}

function f_handleUncaughtErrors(err, req, res, next) {

  console.error(err.stack);
  res.status(500);
  res.json({
    error : "Something broke! - (INTERNAL SERVER ERROR)"
  });
}

// TODO: Remove before going production
// returns test data for the corresponding id
o_router.get("/test/:testId", o_test.requestHandler);


o_router.get("/matches", o_allMatches.handleRequest);

o_router.get("/matches/:id", o_matchById.handleRequest);

o_router.post("/bookings", Express.json(), f_handleParseErrors, o_postBooking.handleRequest);

// Handle uncaught Errors
o_router.use(f_handleUncaughtErrors);

module.exports = o_router;