f_getRedeemedBookings = require("../../model/bookingManager").getRedeemed

/**
 * @module getAllVisitors
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
async function f_requestHandler(req, res, next) {
    try {
        a_bookings = await f_getRedeemedBookings();
        a_bookingData = await Promise.all(
            a_bookings.map(
                async (booking) => {
                    return booking.loadInfo();
                }
            ));
        req.manager.setData(a_bookingData).sendResponse();
    }
    catch (error) {
        next(error);
    }
}


module.exports.handleRequest = f_requestHandler