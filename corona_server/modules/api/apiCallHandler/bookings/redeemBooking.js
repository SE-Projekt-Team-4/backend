/**
 * @module redeemBooking
 */
const ApiCall = require("../../apiCall");
const f_getBookingByVerification = require("../../../model/bookingManager").getByVerificationCode

/**
 * Handler for api calls. Redeems a booking using its verification Code.
 * Expects request body: {
 *  verificationCode ---- verification code of a booking
 * }
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_redeemBooking(apiCall) {
    const s_verificationCode = apiCall.getRequestBody().verificationCode;

    if (s_verificationCode === undefined) {
        apiCall.setError("PARAMNOTVALID").sendResponse();
        return;
    }
    const o_booking = await f_getBookingByVerification(s_verificationCode);

    if (o_booking !== null) {
        if ((await o_booking.redeem()) === true) {
            apiCall.setData(await o_booking.loadInfo()).sendResponse();
        }
        else {
            apiCall.setError("ALREADYREDEEMED", await o_booking.loadInfo()).sendResponse();
        }
    }
    else {
        apiCall.setError("REDEEMNOMATCH").sendResponse();
    }
}

module.exports = f_redeemBooking