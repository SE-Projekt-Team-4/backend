const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById
const f_checkInput = require("../../../model/matchManager").checkData

/**
 * @module putMatch
 */

/**
 * Handler for api calls.
 * Sends a json of all matches using the given api call.
 * 
 * @param {ApiCall} apiCall instance of an api call
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
        apiCall.setError("SPACESLTBOOKINGS").sendResponse();
        return;
    }

    await o_match.update();

    apiCall.setData(await o_match.loadInfo()).sendResponse();
}


module.exports = f_putMatch