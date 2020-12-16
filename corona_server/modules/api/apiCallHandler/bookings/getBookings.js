/**
 * @module getBookings
 */
const ApiCall = require("../../apiCall");
const f_getAllBookings = require("../../../model/bookingManager").getAll

/**
 * Handler for api calls. Returns info of all Bookings.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getBookings(apiCall) {

    a_bookings = await f_getAllBookings();
    a_bookingData = await Promise.all(
        a_bookings.map(
            async (booking) => {
                return booking.loadInfo();
            }
        ));
    apiCall.setData(a_bookingData).sendResponse();
}

module.exports = f_getBookings