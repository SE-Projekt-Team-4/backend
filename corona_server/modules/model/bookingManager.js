const o_visitorManager = require("./visitorManager");
const o_matchManager = require("./matchManager");
const o_dbBookings = require("./dbConectorDummy").bookingQueries;
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
    }

    update() {
        f_updateDataRowFromBooking(this);
        return this;
    }

    delete() {
        o_dbBookings.delete(this._id);
    }

    getVerificationCode() {
        return this._verificationCode;
    }

    redeem() {
        if (this._isRedeemed === true){
            return false;
        }
        else {
            this._isRedeemed = true;
            this.update();
            return true;
        }
    }

    getData() {
        return {
            id: this._id,
            match: this._match.getData(),
            visitor: this._visitor.getData(),
            isRedeemed: this._isRedeemed,
            verificationCode: this._verificationCode
        }
    }

    getVisitor() {
        return this._visitor;
    }

    isValid() {
        return o_typeHelper.test(this._id, "POSITIVE_INT", )
            && this._visitor.isValid()
            && this._match.isValid()
            && typeof this._isRedeemed === "boolean"
            && (o_typeHelper.test(this._verificationCode, "NOT_EMPTY_STRING")|| null);
    }
}

// Private Section --------------------------------------------------------------------------------------------------
function f_loadBookingFromDataRow(bookingData) {
    const o_match = o_matchManager.getById(bookingData.MATCH_ID);
    const o_visitor = o_visitorManager.getById(bookingData.VISITOR_ID);
    const o_booking = new Booking(bookingData.ID, o_match, o_visitor, bookingData.IS_REDEEMED, bookingData.VERIFICATION_CODE);
 
    if (o_booking.isValid()) {
        return o_booking;
    }
    else {
        throw new TypeError("One or more Invalid Attributes");
    }
}

function f_updateDataRowFromBooking(booking) {
    if (booking.isValid()) {
        const o_bookingData = o_dbBookings.update(booking._id, booking._match.getId(), booking._visitor.getId(), booking._isRedeemed, booking._verificationCode);
        booking._id = o_bookingData.ID;
        booking._match = o_matchManager.getById(o_bookingData.MATCH_ID);
        booking._visitor = o_visitorManager.getById(o_bookingData.VISITOR_ID);
        booking._isRedeemed = o_bookingData.IS_REDEEMED;
        booking._verificationCode = o_bookingData.VERIFICATION_CODE;
        return booking;
    }
    else {
        throw new TypeError("One or more Invalid Attributes");
    }
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createBooking(match, visitor) {
    
        if (!match.isValid() || !visitor.isValid()) {
            throw new TypeError("One or more Invalid Parameters");
        }


    const o_bookingData = o_dbBookings.create(match.getId(), visitor.getId(), false, null);

    const o_booking = f_loadBookingFromDataRow(o_bookingData);

    o_booking._verificationCode = Booking._generateVerificationCode(o_booking._id);

    o_booking.update();

    return o_booking;

}

function f_getBooking(id) {
    const o_bookingData = o_dbBookings.get(id);
    if (o_bookingData === null){
        return null;
    }
    return f_loadBookingFromDataRow(o_bookingData);
}

function f_getBookingsForMatch(match) {

    const a_bookingData = o_dbBookings.getByMatchId(match.getId());
    const a_bookings = [];

    a_bookingData.forEach(
        (o_bookingData) => {
            a_bookings.push(f_loadBookingFromDataRow(o_bookingData));
        });
    return a_bookings;

}

function f_getBookingForVerificationCode(verificationCode) {
    const o_bookingData = o_dbBookings.getByVerificationCode(verificationCode);
    if (o_bookingData === null){
        return null;
    }
    return f_loadBookingFromDataRow(o_bookingData);
}

module.exports.create = f_createBooking;
module.exports.getById = f_getBooking;
module.exports.getByVerificationCode = f_getBookingForVerificationCode;
module.exports.getAllForMatch = f_getBookingsForMatch;
