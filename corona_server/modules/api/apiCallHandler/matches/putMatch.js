/**
 * @module postMatch
 */
const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById
const f_checkInput = require("../../../model/matchManager").checkData

/**
 * Handler for api calls. Updates a match. Can only reduce maxSpaces if they do not become less than the bookings.
 *  Expects request body: {
 *  opponent ---- Name of the opponent the game is against
 *  date ---- DateTimeString representing start of the game using the full ISO 8601 UTC Z-variation
 *  maxSpaces ---- Maximum number of bookings that can be made for the match
 *  isCancelled ---- Shows current status of the match, whether it will be cancelled
 * }
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_putMatch(apiCall) {
    const o_params = apiCall.getRequestParams();
    const o_body = apiCall.getRequestBody();

    const o_match = await f_getMatch(o_params.id);

    if (o_match === null) {
        apiCall.setError("NOMATCH").sendResponse();
    }

    const s_opponent = o_body.opponent;
    const s_dateTimeString = o_body.date;
    const n_maxSpaces = o_body.maxSpaces;
    const b_isCancelled = o_body.isCancelled;

    if (!f_checkInput(s_opponent, s_dateTimeString, n_maxSpaces, b_isCancelled)) {
        apiCall.setError("PARAMNOTVALID").sendResponse();
        return;
    }
    p_updateSpaces = o_match.setMaxSpaces(n_maxSpaces);
    o_match.setOpponent(s_opponent);
    o_match.setDateTimeFromString(s_dateTimeString);
    o_match.setIsCancelled(b_isCancelled);

    if ((await p_updateSpaces) === null) {
        const n_bookings = await o_match.getNumberOfBookings();
        apiCall.setError("SPACESLTBOOKINGS", {
            maxSpaces: n_maxSpaces,
            numBookings: n_bookings,
            freeSpaces: n_maxSpaces - n_bookings
        }).sendResponse();
        return;
    }

    await o_match.update();

    apiCall.setData(await o_match.loadInfo()).sendResponse();
}

module.exports = f_putMatch