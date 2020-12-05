f_getMatchesBefore = require("../../model/matchManager").getBefore

/**
 * @module deleteBookings4Weeks
 * @version 0.0.1
 */

/**
 * Handler for express request.
 * 
 * Returns test data for an given id. If Id is not valid or an internal server errror occures,
 * the response object is changed correspondingly.
 * 
 * @param {Express.Request} req A request based on the Express framework
 * @param {Express.Response} res A Response based on the express framework, when the Promises resolves, this is sent to the client
 */

const BOOKINGS_SAVE_DURATION = 28 //Days  -- 4 Weeks

async function f_requestHandler(req, res, next) {
    try {
        o_date = new Date(Date.now());
        o_date.setDate(o_date.getDate() - BOOKINGS_SAVE_DURATION);
        const a_matches = f_getMatchesBefore(o_date);
        
        var a_bookings = [];
        a_matches.forEach(
            (o_match) => {
                a_bookings = a_bookings.concat(o_match.getBookings());
            }
        );

        var a_bookingData = [];
        a_bookings.forEach(
            (o_booking) => {
                a_bookingData.push(o_booking.getData());
                o_booking.delete(true);
            }
        );

        req.manager.setData(a_bookingData).sendResponse();   
    }
    catch (error) {
        console.log(req.manager.getResponseObject());
        console.error(error);
        req.manager.setError("SYSERR").sendResponse();
    }

}


module.exports.handleRequest = f_requestHandler