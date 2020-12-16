/**
 * @module getBookingsRedeemed
 */
const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById

/**
 * Handler for api calls. Returns info of redeemed Bookings for a match.
 * Expects request parameter: id - Id of the booking.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getBookingsRedeemedForMatch(apiCall) {
    o_match = await f_getMatch(apiCall.getRequestParams().id);

    if (o_match === null) {
        apiCall.setError("NOMATCH").sendResponse();
    }

    else {
        a_bookings = await o_match.getRedeemedBookings();
        a_bookingData = await Promise.all(
            a_bookings.map(
                async (booking) => {
                    return await booking.loadInfo();
                }
            ));
        apiCall.setData(a_bookingData).sendResponse();
    }
}


module.exports = f_getBookingsRedeemedForMatch