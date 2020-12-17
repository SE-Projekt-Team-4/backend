/**
 * @module getMatchById
 */
const ApiCall = require("../../apiCall");
const f_getMatch = require("../../../model/matchManager").getById

/**
 * Handler for api calls. Returns a match using its id.
 * Expects request parameter: id - Id of match to return
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getMatchById(apiCall) {
    o_match = await f_getMatch(apiCall.getRequestParams().id)

    if (o_match !== null) {
        apiCall.setData(await o_match.loadInfo()).sendResponse();
    }
    else {
        apiCall.setError("NOMATCH").sendResponse();
    }
}

module.exports = f_getMatchById