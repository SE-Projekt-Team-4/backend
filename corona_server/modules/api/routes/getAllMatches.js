f_getAllMatches = require("../../model/matchManager").getAll

/**
 * @module getAllMatches
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
        a_matches = await f_getAllMatches();
        a_matchdata = [];
        a_matches.forEach(
            (o_match) => {
                a_matchdata.push(o_match.getData())
            }
        );
        req.manager.setData(a_matchdata).sendResponse();   
    }
    catch (error) {
        console.log(req.manager.getResponseObject());
        console.error(error);
        req.manager.setError("SYSERR").sendResponse();
    }

}


module.exports.handleRequest = f_requestHandler