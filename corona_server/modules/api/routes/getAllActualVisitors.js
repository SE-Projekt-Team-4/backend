f_getActualVisitors = require("../../model/visitorManager").getActual

/**
 * @module getAllVisitors
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
        a_visitors = await f_getActualVisitors();
        a_visitorData = await Promise.all(
            a_visitors.map(
                async (visitor) => {
                    return visitor.loadInfo();
                }
            ));
        req.manager.setData(a_visitorData).sendResponse();
    }
    catch (error) {
        next(error);
    }
}


module.exports.handleRequest = f_requestHandler