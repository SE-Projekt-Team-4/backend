f_getMatchesBefore = require("../../../model/matchManager").getBefore

/**
 * @module deleteBookingsOverSaveDuration
 */

/**
 * Handler for express request.
 * 
 * Deletes all bookings and connected visitors for matches that were so long ago that all bookings are over the save duration.
 * 
 * @param {Express.Request} req An express request with 
 * @param {Express.Response} res A Response based on the express framework, when the Promises resolves, this is sent to the client
 */

const BOOKINGS_SAVE_DURATION = 28 //Days  -- 4 Weeks

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