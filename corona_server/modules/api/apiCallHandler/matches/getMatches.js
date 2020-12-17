/**
 * @module getMatches
 */
const ApiCall = require("../../apiCall");
const f_getAllMatches = require("../../../model/matchManager").getAll

/**
 * Handler for api calls. Returns all matches.
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_getMatches(apiCall) {
    a_matches = await f_getAllMatches();
    a_matchdata = await Promise.all(
        a_matches.map(
            async (matches) => {
                return matches.loadInfo();
            }
        ));
    apiCall.setData(a_matchdata).sendResponse();
}

module.exports = f_getMatches