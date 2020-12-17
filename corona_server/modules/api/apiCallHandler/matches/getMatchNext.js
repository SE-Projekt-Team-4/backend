/**
 * @module getMatchNext
 */
const ApiCall = require("../../apiCall");
const f_getFirstMatchAfter = require("../../../model/matchManager").getFirstAfter

/**
 * Handler for api calls. Returns the next match that will start or null.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getMatchNext(apiCall) {
    o_date = new Date(Date.now());
    o_match = await f_getFirstMatchAfter(o_date);

    if (o_match !== null) {
        apiCall.setData(await o_match.loadInfo()).sendResponse();
    }
    else {
        apiCall.setError("NOMATCH").sendResponse();
    }
}

module.exports = f_getMatchNext