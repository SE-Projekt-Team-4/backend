/**
 * @module deleteMatch
 */
const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById

/**
 * Handler for api calls. Deltes a match
 * Expects request parameter: id - Id of match to delete
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_deleteMatch(apiCall) {

    const o_match = await f_getMatch(apiCall.getRequestParams().id);

    if (o_match === null) {
        apiCall.setError("NOMATCH").sendResponse();
    }
    await o_match.delete(true);
    apiCall.setData(o_match).sendResponse();
}

module.exports = f_deleteMatch