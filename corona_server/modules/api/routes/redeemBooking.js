f_getBookingByVerification = require("../../model/bookingManager").getByVerificationCode

/**
 * @module redeemBooking
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
        const s_verificationCode = req.body.verificationCode;
        const o_booking = await f_getBookingByVerification(s_verificationCode);

        if (o_booking !== null) {
            if ((await o_booking.redeem()) === true) {
                req.manager.setData(await o_booking.loadInfo()).sendResponse();
            }
            else {
                req.manager.setError("ALREADYREDEEMED", await o_booking.loadInfo()).sendResponse();
            }
        }
        else {
            req.manager.setError("REDEEMNOMATCH").sendResponse();
        }

    }
    catch (error) {
        next(error);
    }
}

module.exports.handleRequest = f_requestHandler