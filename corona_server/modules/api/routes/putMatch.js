f_getMatch = require("../../model/matchManager").getById

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

        o_match = await f_getMatch(req.params.id);

        if (o_match === null) {
            req.manager.setError("NOMATCH").sendResponse();
        }

        const s_opponent = req.body.opponent;
        const s_dateTimeString = req.body.date;
        const n_maxSpaces = req.body.maxSpaces;
        const b_isCancelled = req.body.isCancelled;

        o_match.setOpponent(s_opponent);

        //===========================================

        o_match.setDateTimeFromString(s_dateTimeString);
        o_match.setMaxSpaces(n_maxSpaces);
        o_match.setIsCancelled(b_isCancelled);
        o_match.update();
        req.manager.setData(o_match.getData()).sendResponse();


    }
    catch (error) {
        if (error instanceof TypeError) {
            console.log(error);
            req.manager.setError("PARAMNOTVALID").sendResponse();
        }
        else{
            console.log(req.manager.getResponseObject());
            console.error(error);
            req.manager.setError("SYSERR").sendResponse();
        }
    }


}


module.exports.handleRequest = f_requestHandler