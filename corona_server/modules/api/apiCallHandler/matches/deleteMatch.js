const f_getMatch = require("../../../model/matchManager").getById

/**
 * @module deleteMatch
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
async function f_deleteMatch(apiCall) {

    const o_match = await f_getMatch(apiCall.getRequestParams().id);

    if (o_match === null) {
        apiCall.setError("NOMATCH").sendResponse();
    }

    await o_match.delete(true);
    apiCall.setData(o_match).sendResponse();

}

module.exports = f_deleteMatch