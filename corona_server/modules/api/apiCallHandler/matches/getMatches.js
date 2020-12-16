const ApiCall = require("../../apiCall");
const f_getAllMatches = require("../../../model/matchManager").getAll

/**
 * @module getMatches
 */

/**
 * Handler for api calls.
 * Sends a json of all matches using the given api call.
 * 
 * @param {ApiCall} apiCall instance of an api call
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