const o_visitorManager = require("./visitorManager");
const o_matchManager = require("./matchManager");
const o_dbBookings = require("../../database/DBConnector_Final").bookingQueries;
const o_typeHelper = require("../typeHelper");

class Booking {

    static _generateVerificationCode(id) {
        const s_verification = ("000" + Math.floor(Math.random() * 5833).toString(18)).slice(-3).toUpperCase();
        const s_idPart = ("000000000" + id).slice(-9);
        return (s_idPart + s_verification);
    }

    // Private Constructor
    constructor(id, match, visitor, isRedeemed, verificationCode) {
        this._id = id;
        this._match = match;
        this._visitor = visitor;
        this._isRedeemed = isRedeemed;
        this._verificationCode = verificationCode;
        // Bind this for async functions
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.redeem = this.redeem.bind(this);
    }

    async loadInfo() {
        return {
            id: this._id,
            match: await this._match.loadInfo(),
            visitor: await this._visitor.loadInfo(),
            isRedeemed: this._isRedeemed,
            verificationCode: this._verificationCode
        }
    }

    getVerificationCode() {
        return this._verificationCode;
    }

    getIsRedeemed() {
        return this._isRedeemed;
    }

    getVisitor() {
        return this._visitor;
    }

    getId() {
        return this._id;
    }

    isValid() {
        return o_typeHelper.test(this._id, "POSITIVE_INT",)
            && (this._visitor !== null && this._visitor.isValid())
            && (this._match !== null && this._match.isValid())
            && typeof this._isRedeemed === "boolean"
            && (o_typeHelper.test(this._verificationCode, "NOT_EMPTY_STRING") || null);
    }

    update() {
        return f_updateDataRowFromBooking(this);
    }

    async delete(isToDeleteVisitor) {
        if (isToDeleteVisitor !== false) {
            try{
                await this.getVisitor().delete(); // Wait for error so we dont delete booking if visitor was not deleted
            }
            catch (err) {
                console.log("Did not delete Booking due to Error during deletion of visitor")
                throw (err);
            }
        }
        return o_dbBookings.delete(this._id);
    }

    async redeem() {
        if (this._isRedeemed === true) {
            return false;
        }
        else {
            this._isRedeemed = true;
            await this.update(); // Wait for Errors so we dont return true when update fails
            return true;
        }
    }

}

// Private Section --------------------------------------------------------------------------------------------------
async function f_loadBookingFromDataRow(bookingData) {
    const p_match = o_matchManager.getById(bookingData.MATCH_ID);
    const p_visitor = o_visitorManager.getById(bookingData.VISITOR_ID);


    const o_booking = new Booking(bookingData.ID, await p_match, await p_visitor,
        (bookingData.IS_REDEEMED != 0), bookingData.VERIFICATION_CODE);

    if (o_booking.isValid()) {
        return o_booking;
    }
    else {
        throw new Error("INVALID");
    }
}

async function f_updateDataRowFromBooking(booking) {
    if (!booking.isValid()) {
        throw new Error("INVALID");
    }

    const b_isRedeemed = booking._isRedeemed ? 1 : 0;

    var o_bookingData = await o_dbBookings.update(booking._id, booking._match.getId(), booking._visitor.getId(),
        b_isRedeemed, booking._verificationCode);

    const p_match = o_matchManager.getById(o_bookingData.MATCH_ID);
    const p_visitor = o_visitorManager.getById(o_bookingData.VISITOR_ID);

    booking._id = o_bookingData.ID;
    booking._match = await p_match;
    booking._visitor = await p_visitor;
    booking._isRedeemed = (o_bookingData.IS_REDEEMED != 0) // Create boolean based on truthy falsy
    booking._verificationCode = o_bookingData.VERIFICATION_CODE;

    return booking;

}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
async function f_createBooking(match, visitor) {
        if (!match.isValid() || !visitor.isValid()) {
            throw new Error("INVALID");
        }
        
        const o_bookingData = await o_dbBookings.create(match.getId(), visitor.getId(), 0, null);
        var o_booking = await f_loadBookingFromDataRow(o_bookingData);

        try {
            o_booking._verificationCode = Booking._generateVerificationCode(o_booking._id);
            await o_booking.update(); // Wait for update and Errors
        }
        catch (error){
            try{    
                await o_booking.delete();
            }
            catch (rollBackError){
                console.log("Rollback Error: Booking ", o_booking.getId(), "was saved with incomplete / wrong data");
            }
            throw(error);
        }

        return o_booking;
}

function f_checkConstructorData (match, visitor) {
    return (!match.isValid() || !visitor.isValid())
}

async function f_getBooking(id) {
    const o_bookingData = await o_dbBookings.get(id);
    if (o_bookingData === undefined) {
        return null;
    }
    return f_loadBookingFromDataRow(o_bookingData);
}

async function f_getBookingsForMatch(match) {

    var a_bookingData = await o_dbBookings.getByMatchId(match.getId());

    return Promise.all(
        a_bookingData.map(
            async (bookingData) => {
                return f_loadBookingFromDataRow(bookingData);
            }
        )
    );
}

async function f_getRedeemedBookingsForMatch(match) {

    var a_bookingData = await o_dbBookings.getRedeemedByMatchId(match.getId());

    return Promise.all(
        a_bookingData.map(
            async (bookingData) => {
                return f_loadBookingFromDataRow(bookingData);
            }
        )
    );
}

async function f_getAllBookings() {

    var a_bookingData = await o_dbBookings.getAll();

    return Promise.all(
        a_bookingData.map(
            async (bookingData) => {
                return f_loadBookingFromDataRow(bookingData);
            }
        )
    );
}

async function f_getRedeemedBookings() {

    var a_bookingData = await o_dbBookings.getRedeemed();
    return Promise.all(
        a_bookingData.map(
            async (bookingData) => {
                return f_loadBookingFromDataRow(bookingData);
            }
        )
    );
}

async function f_getBookingForVerificationCode(verificationCode) {
    const o_bookingData = await o_dbBookings.getByVerificationCode(verificationCode);
    if (o_bookingData === undefined) {
        return null;
    }
    return await f_loadBookingFromDataRow(o_bookingData);
}






module.exports.create = f_createBooking;
module.exports.getById = f_getBooking;
module.exports.getByVerificationCode = f_getBookingForVerificationCode;
module.exports.getAll = f_getAllBookings;
module.exports.getAllForMatch = f_getBookingsForMatch;
module.exports.getRedeemed = f_getRedeemedBookings;
module.exports.getRedeemedForMatch = f_getRedeemedBookingsForMatch;
module.exports.checkData = f_checkConstructorData;
