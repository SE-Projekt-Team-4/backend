/**
 * @module postMatch
 */
const ApiCall = require("../../apiCall");
const f_createMatch = require("../../../model/matchManager").create
const f_checkInput = require("../../../model/matchManager").checkData

/**
 * Handler for api calls. Creates a match.
 *  Expects request body: {
 *  opponent ---- Name of the opponent the game is against
 *  date ---- DateTimeString representing start of the game using the full ISO 8601 UTC Z-variation
 *  maxSpaces ---- Maximum number of bookings that can be made for the match
 *  isCancelled ---- Shows current status of the match, whether it will be cancelled
 * }
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_postMatch(apiCall) {

    const o_body = apiCall.getRequestBody();
    const s_opponent = o_body.opponent;
    const s_dateTimeString = o_body.date;
    const n_maxSpaces = o_body.maxSpaces;
    const b_isCancelled = o_body.isCancelled;

    if (!f_checkInput(s_opponent, s_dateTimeString, n_maxSpaces, b_isCancelled)) {
        apiCall.setError("PARAMNOTVALID").sendResponse();
        return;
    }

    const o_match = await f_createMatch(s_opponent, s_dateTimeString, n_maxSpaces, b_isCancelled);
    apiCall.setData(await o_match.loadInfo()).sendResponse();

}

module.exports = f_postMatch