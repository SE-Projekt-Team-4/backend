/**
 * @module postBooking
 */
const ApiCall = require("../../apiCall");
const f_createBooking = require("../../../model/bookingManager").create
const f_createVisitor = require("../../../model/visitorManager").create
const f_checkVisitorInput = require("../../../model/visitorManager").checkData
const f_getMatch = require("../../../model/matchManager").getById
const f_sendMail = require("../../../mailHelper").sendConfirmationMail
const f_blockConcurrencyGroupedBy = require("../../../concurrencyHelper").blockConcurrencyGroupedByKey

/**
 * Handler for api calls. Returns info of redeemed Bookings for a match.
 * Expects request body: {
 *  matchId ---- Id of the match the booking is for
 *  fName ---- First Name of visitor
 *  lName ---- Last Name of visitor
 *  city ---- City of Visitor
 *  postcode ---- Postcode of Visitor
 *  street ---- Street of Visitor
 *  houseNumber ---- Housenumber of Visitor
 *  phoneNumber ---- Phonenumber of Visitor
 *  eMail ---- E-mail of Visitor
 * }
 * @param {ApiCall} apiCall Instance of an api call.
 */
async function f_postBooking(apiCall) {

    const o_params = apiCall.getRequestBody();
    const n_id = o_params.matchId;
    const s_fName = o_params.fName;
    const s_lName = o_params.lName;
    const s_city = o_params.city;
    const s_postcode = o_params.postcode;
    const s_street = o_params.street;
    const s_houseNumber = o_params.houseNumber;
    const s_phoneNumber = o_params.phoneNumber;
    const s_eMail = o_params.eMail;

    // Check Data ----------------------------------------------------------------------------------
    if (isNaN(n_id)) { // Id is not a number
        apiCall.setError("PARAMNOTVALID").sendResponse();
        return;
    }
    if (!f_checkVisitorInput(s_fName, s_lName, s_city, s_postcode, s_street, s_houseNumber, s_phoneNumber, s_eMail)) { // Input for visitor not valid
        apiCall.setError("PARAMNOTVALID").sendResponse();
        return;
    }

    // Check if Match exists ------------------------------------------------------------------------
    var o_match = await f_getMatch(n_id);
    if (o_match === null) { // No match found for id
        apiCall.setError("BOOKNOMATCH").sendResponse();
        return;
    }

    //== Block other bookings for same match to prevent concurrency issues ==============================
    const f_releaseConcurrencyBlock = await f_blockConcurrencyGroupedBy(o_match.getId()); // Save release handler

    try {
        if (await o_match.getFreeSpaces() <= 0) { // No free spaces for match
            apiCall.setError("BOOKNOSPACE").sendResponse();
            f_releaseConcurrencyBlock(); // Release Block if request is aborted early -----------------<>
            return;
        }
        var o_visitor = f_createVisitor(s_fName, s_lName, s_city, s_postcode, s_street, s_houseNumber, s_phoneNumber, s_eMail);
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
        throw error;
    }
    finally {
        f_releaseConcurrencyBlock(); // Release Block -------------------------------------------------<>
    }
    //===================================================================================================

    try { // Send confirmation mail
        await f_sendMail(o_bookInfo.visitor.fName, o_bookInfo.visitor.lName, o_bookInfo.match.id, o_bookInfo.match.opponent,
            o_bookInfo.match.date, o_bookInfo.verificationCode, o_bookInfo.visitor.eMail)
        apiCall.setData(o_bookInfo).sendResponse();
    }
    catch (error) {
        // Delete Booking if confirmation e-Mail could not be send
        //== Reapply Concurrency Block for Rollback =====================================================
        const f_releaseConcurrencyBlock = await f_blockConcurrencyGroupedBy(o_match.getId());
        try {
            o_booking.delete(true);
        }
        catch (err) {
            console.log("Error during Rollback")
            console.log(err); // Log Rollback errrors
        }
        finally{
            f_releaseConcurrencyBlock(); // Release Block ---------------------------------------------<>
        }
        //===============================================================================================
        throw error; // Rethrow Error for Further Error Handling
    }
}

module.exports = f_postBooking