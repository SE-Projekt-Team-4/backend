f_createMatch = require("../../../model/matchManager").create
f_checkInput = require("../../../model/matchManager").checkData

/**
 * @module postMatch
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

    const o_match = await f_createMatch(s_opponent, s_dateTimeString, n_maxSpaces, b_isCancelled)
    apiCall.setData(await o_match.loadInfo()).sendResponse();

}


module.exports = f_postMatch