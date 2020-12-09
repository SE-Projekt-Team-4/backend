f_createBooking = require("../../model/bookingManager").create
f_createVisitor = require("../../model/visitorManager").create
f_getMatch = require("../../model/matchManager").getById
f_sendMail = require("../../mailHelper").sendConfirmationMail

/**
 * @module postBooking
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
        const n_id = req.body.matchId;
        const s_fName = req.body.fName;
        const s_lName = req.body.lName;
        const s_city = req.body.city;
        const s_postcode = req.body.postcode;
        const s_street = req.body.street;
        const s_houseNumber = req.body.houseNumber;
        const s_phoneNumber = req.body.phoneNumber;
        const s_eMail = req.body.eMail;

        if (isNaN(n_id)) {
            req.manager.setError("PARAMNOTVALID").sendResponse(res);
        }
        else {
            const o_visitor = f_createVisitor(s_fName, s_lName, s_city, s_postcode, s_street, s_houseNumber, s_phoneNumber, s_eMail);
            const o_match = await f_getMatch(n_id);


            if (o_match === null) {
                req.manager.setError("BOOKNOMATCH").sendResponse();
            }
            else if (o_match.getFreeSpaces() <= 0) {
                req.manager.setError("BOOKNOSPACE").sendResponse();
            }
            else {
                const o_booking = await f_createBooking(o_match, o_visitor);

                var o_bookInfo = o_booking.getInfo();

                await f_sendMail(o_bookInfo.visitor.fName, o_bookInfo.visitor.lName, o_bookInfo.match.id, o_bookInfo.match.opponent,
                    o_bookInfo.match.date, o_bookInfo.verificationCode, o_bookInfo.visitor.eMail)
                req.manager.setData(o_bookInfo).sendResponse();
            }
        }
    }
    catch (error) {
        if (o_booking) {
            o_booking.delete(true); // D.I.Y. Rollback -> Booking is deleted (not undone)
        }
        if (error instanceof TypeError) {
            console.log(error);
            req.manager.setError("PARAMNOTVALID").sendResponse();
        }
        else {
            console.log(req.manager.getResponseObject());
            console.error(error);
            req.manager.setError("SYSERR").sendResponse();
        }
    }


}


module.exports.handleRequest = f_requestHandler