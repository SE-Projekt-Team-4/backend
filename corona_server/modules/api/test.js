// TODO: Delete this file before going production

/**
 * @module test
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
function f_requestHandler(req, res, next) {
    f_getTestData(req.params.testId)
        .then(
            (fulfilled) => {
                res.status(200);
                console.log("inTest");
                res.responseData = fulfilled;
                next();
            },
            (rejected) => {
                res.status(rejected.status);
                throw new Error("babui");
                res.json(rejected.errorData);
            }
        ).catch(
            (err) => {
                next(err);
        });
}
/**
 * Get test data.
 * 
 * Takes an String and returns an corresponding json
 * 
 * @param {String} testId Eine Id die aus der Request entnommen wird
 * @returns {Promise} Gibt ein Promise zurück dass mit ein JSON resolved oder rejected
 */

function f_getTestData(testId) {
    return new Promise((resolve, reject) => {
        if (testId == 1) {
            resolve({
                id: "stuff",
                fName: "11111",
                lName: "11111"
            });
        }
        else if (testId == 2) {
            resolve({
                id: "stuff2",
                fName: "22222",
                lName: "22222"
            });
        }
        else if (testId == 5) {
            throw new Error();
        }
        else {
            reject({
                status : 404,
                errorData : {
                    message : "No data found for id: " + testId
                }
            });
        }
    });
}

module.exports.requestHandler = f_requestHandler