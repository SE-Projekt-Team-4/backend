f_createBooking = require("../../model/bookingManager").create
f_createVisitor = require("../../model/visitorManager").create
f_checkInput = require("../../model/visitorManager").checkData
f_getMatch = require("../../model/matchManager").getById
f_sendMail = require("../../mailHelper").sendConfirmationMail
f_blockConcurrencyGroupedBy = require("../../concurrencyHelper").f_blockConcurrencyGroupedByKey

/**
 * @module postBooking
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
            return;
        }

        if (!f_checkInput(s_fName, s_lName, s_city, s_postcode, s_street, s_houseNumber, s_phoneNumber, s_eMail)) {
            req.manager.setError("PARAMNOTVALID").sendResponse();
            return;
        }

        
        var o_visitor = f_createVisitor(s_fName, s_lName, s_city, s_postcode, s_street, s_houseNumber, s_phoneNumber, s_eMail);


        var o_match = await f_getMatch(n_id);

        if (o_match === null) {
            req.manager.setError("BOOKNOMATCH").sendResponse();
            return;
        }

        if (await o_match.getFreeSpaces() <= 0) {
            req.manager.setError("BOOKNOSPACE").sendResponse();
            return;
        }

        var f_releaseConcurrencyBlock = await f_blockConcurrencyGroupedBy(o_match.getId()); // Save Release handler
        try {

            var o_booking = await f_createBooking(o_match, await o_visitor);
            var o_bookInfo = await o_booking.loadInfo();

        }
        catch (error) {
            try { // Rollback
                if (o_booking !== undefined) {
                    o_booking.delete(true);
                }
                else if (o_visitor !== undefined) {
                    o_visitor.delete(true);
                }
            }
            catch (err) {
                console.error("Error during Rollback")
                console.log(err);
            }
            f_releaseConcurrencyBlock();
            throw error;
        }
        f_releaseConcurrencyBlock();

        try {
            await f_sendMail(o_bookInfo.visitor.fName, o_bookInfo.visitor.lName, o_bookInfo.match.id, o_bookInfo.match.opponent,
                o_bookInfo.match.date, o_bookInfo.verificationCode, o_bookInfo.visitor.eMail)
            req.manager.setData(o_bookInfo).sendResponse();
        }
        catch (error) { // Delete Booking if E-Mail could not be send
            // Reapply Concurrency Block for Rollback duration
            const f_releaseConcurrencyBlock = await f_blockConcurrencyGroupedBy(o_match.getId());
            try {
                o_booking.delete(true);
            } catch (err) {
                console.error("Error during Rollback")
                console.log(err);
            }
            f_releaseConcurrencyBlock();
            throw error;
        }
    }
    catch {
            next(error);
            f_releaseConcurrencyBlock();
    }
}


module.exports.handleRequest = f_requestHandler