const o_visitorManager = require ("./visitorManager");
const o_matchManager = require ("./matchManager");
const o_dbBookings = require ("../dbConectorDummy").bookingQueries;

class Booking {

    static _generateVerificationCode(id) {
        const s_verification = ("000" + Math.floor(Math.random() * 5833).toString(18)).slice(-3).toUpperCase();
        const s_idPart = ("000000000" + id).slice(-9);
        return(s_idPart + s_verification);
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
        o_dbBookings.update(this._id, this._match.getId(), this._visitor.getId(), this._isRedeemed, this._verificationCode);
        return this;
    }

    delete() {
        o_dbBookings.delete(this._id);
    }

    getVerificationCode() {
        return this._verificationCode;
    }

    redeem() {
        this._isRedeemed = true;
    }

    getData() {
        return {
            id : this._id,
            match : this._match.getData(),
            visitor : this._visitor.getData(),
            isRedeemed : this._isRedeemed,
            verificationCode : this._verificationCode
        }
    }

}

// Private Section --------------------------------------------------------------------------------------------------
function f_loadBookingFromDataRow(bookingData) {
    const o_match = o_matchManager.getById(bookingData.MATCH_ID);
    const o_visitor = o_visitorManager.getById(bookingData.VISITOR_ID);
    return new Booking(bookingData.ID, o_match, o_visitor, bookingData.IS_REDEEMED, bookingData.VERIFICATION_CODE);
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createBooking(match, visitor) {

    const o_bookingData = o_dbBookings.create(match.getId(), visitor.getId(), false, "");

    const o_booking = f_loadBookingFromDataRow(o_bookingData);

    o_booking._verificationCode = Booking._generateVerificationCode(o_booking._id);

    o_booking.update();

    return o_booking;
}

function f_getBooking(id) {
    const o_bookingData = o_dbBookings.get(id);
    return f_loadBookingFromDataRow(o_bookingData);
}

function f_getBookingsForMatch(match) {
    const a_bookingData = o_dbBookings.getByMatchId(match.getId());
    const a_bookings = [];
    for (const o_bookingData in a_bookingData) {
        a_bookings.push(f_loadBookingFromDataRow(o_bookingData));
    }
    return a_bookings;
}

module.exports.create = f_createBooking;
module.exports.getById = f_getBooking;
module.exports.getAllForMatch = f_getBookingsForMatch;
