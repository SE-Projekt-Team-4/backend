/**
 * @module deleteBookingsOverSaveDuration
 */
const ApiCall = require("../../apiCall");
const f_getMatchesBefore = require("../../../model/matchManager").getBefore

/** Saves the number of days that bookings should be saved, after the match happend */
const BOOKINGS_SAVE_DURATION = 28 //Days  -- 4 Weeks

/**
 * Handler for api calls. Deletes all Bookings for matches that are older than the bookings save duration.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_deleteBookingsOverSaveDuration(apiCall) {

    o_date = new Date(Date.now());
    o_date.setDate(o_date.getDate() - BOOKINGS_SAVE_DURATION);

    const a_matches = await f_getMatchesBefore(o_date);

    var a_bookings = [];

    var a_bookingArrays = await Promise.all(
        a_matches.map(
            async (match) => {
                return match.getBookings();
            }
        )
    );

    a_bookingArrays.forEach(
        (bookingArray) => {
            a_bookings = a_bookings.concat(bookingArray);
        }
    );

    var a_bookingData = await Promise.all(
        a_bookings.map(
            async (booking) => {
                try {
                    await booking.delete(true);
                }
                catch (err) {
                    console.log(err);
                }
                return booking.loadInfo();
            }
        )
    );

    apiCall.setData(a_bookingData).sendResponse();
}

module.exports = f_deleteBookingsOverSaveDuration