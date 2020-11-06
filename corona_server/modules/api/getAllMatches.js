f_getAllMatches = require("../model/matchManager").getAll

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
    console.log("inMatches");
    try {
        a_matches = await f_getAllMatches();
        a_matchdata = [];
        a_matches.forEach(
            (o_match) => {
                a_matchdata.push(o_match.getData())
            }
        );
        res.status(200);
        res.json(
            {
                data : a_matchdata
            });      
    }
    catch (error) {
        next(error);
    }

}


module.exports.handleRequest = f_requestHandler