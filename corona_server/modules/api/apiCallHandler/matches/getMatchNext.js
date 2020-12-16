f_getFirstMatchAfter = require("../../../model/matchManager").getFirstAfter

/**
 * @module getNextMatch
 * @version 0.0.1
 */

/**
 * Handler for express request.
 * 
 * Returns test data for an given id. If Id is not valid or an internal server errror occures,
 * the response object is changed correspondingly.
 * 
 * @param {Express.Request} req A request based on the Express framework
 * @param {Express.Response} res A Response based on the express framework, when the Promises resolves, this is sent to the client
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