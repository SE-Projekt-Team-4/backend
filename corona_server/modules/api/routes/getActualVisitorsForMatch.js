f_getMatch = require("../../model/matchManager").getById

/**
 * @module getVisitorsForMatch
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

        else {
            a_visitors = await o_match.getActualVisitors();
            a_visitorData = await Promise.all(
                a_visitors.map(
                    async (visitor) => {
                        return await visitor.loadInfo();
                    }
                ));
            req.manager.setData(a_visitorData).sendResponse();
        }


    }
    catch (error) {
        next(error);
    }

}


module.exports.handleRequest = f_requestHandler