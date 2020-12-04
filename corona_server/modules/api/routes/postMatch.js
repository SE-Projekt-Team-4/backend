f_createMatch = require("../../model/matchManager").create

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
async function f_requestHandler(req, res, next) {
    try {
        //console.log(req.body);
        const s_opponent = req.body.opponent;
        const s_dateTimeString = req.body.dateTime;
        const n_maxSpaces = req.body.maxSpaces;
        const b_isCancelled = req.body.isCancelled;

        const o_match = f_createMatch(s_opponent, s_dateTimeString, n_maxSpaces, b_isCancelled)
        req.manager.setData(o_match.getData()).sendResponse();

    }
    catch (error) {
        if (error instanceof TypeError) {
            console.log(error);
            req.manager.setError("PARAMNOTVALID").sendResponse();
        }
        console.log(req.manager.getResponseObject());
        console.error(error);
        req.manager.setError("SYSERR").sendResponse();
    }


}


module.exports.handleRequest = f_requestHandler