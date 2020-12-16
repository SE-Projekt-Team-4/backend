/**
 * @module getBookingsForMatch
 */
const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById

/**
 * Handler for api calls. Returns info of all Bookings for a certain match.
 * Expects request parameter: id - Id of the booking.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getBookingsForMatch(apiCall) {

    o_match = await f_getMatch(apiCall.getRequestParams().id);

    if (o_match === null) {
        apiCall.setError("NOMATCH").sendResponse();
        return;
    }

    a_bookingData = [];
    a_bookings = await o_match.getBookings();
    a_bookingData = await Promise.all(
        a_bookings.map(
            async (booking) => {
                return booking.loadInfo();
            }
        ));
    apiCall.setData(a_bookingData).sendResponse();
}

module.exports = f_getBookingsForMatch