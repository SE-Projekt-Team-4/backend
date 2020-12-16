/**
 * @module getBookingsRedeemed
 */
const ApiCall = require("../../apiCall");
const f_getRedeemedBookings = require("../../../model/bookingManager").getRedeemed

/**
 * Handler for api calls. Returns info of redeemed Bookings
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getBookingsRedeemed(apiCall) {

    a_bookings = await f_getRedeemedBookings();
    a_bookingData = await Promise.all(
        a_bookings.map(
            async (booking) => {
                return booking.loadInfo();
            }
        ));
    apiCall.setData(a_bookingData).sendResponse();
}


module.exports = f_getBookingsRedeemed