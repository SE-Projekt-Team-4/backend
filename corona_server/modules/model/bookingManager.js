/**
 * @module bookingManager
 */

const o_visitorManager = require("./visitorManager");
const o_matchManager = require("./matchManager");
const o_dbBookings = require("../../database/DBConnector_Final").bookingQueries;
const o_typeHelper = require("../typeHelper");

/** Class representing a booking. As only instances of this class are exported, the constructor is not visible from outside the module*/
class Booking {
    /**
     * Creates a alphanumeric verificationCode based on the id of the booking. Guarentees no collusion up to ids of 10^9 -1 and is partly randomized.
     * @param {number} id 
     */
    static _generateVerificationCode(id) {
        const s_verification = ("000" + Math.floor(Math.random() * 5833).toString(18)).slice(-3).toUpperCase();
        const s_idPart = ("000000000" + id % 1000000000).slice(-9);
        return (s_idPart + s_verification);
    }

    // Private Constructor
    constructor(id, match, visitor, isRedeemed, verificationCode) {
        this._id = id;
        this._match = match;
        this._visitor = visitor;
        this._isRedeemed = isRedeemed;
        this._verificationCode = verificationCode;
        // Bind "this" for async functions
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.redeem = this.redeem.bind(this);
    }

    /**
    * Returns info describing this booking.
    * @returns {object} Object describing this booking.
    */
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

    /**
    * Returns true if this booking is valid.
    * @returns {boolean} True if this booking is valid, otherwise false.
    */
    isValid() {
        return o_typeHelper.test(this._id, "POSITIVE_INT",)
            && (this._visitor !== null && this._visitor.isValid())
            && (this._match !== null && this._match.isValid())
            && typeof this._isRedeemed === "boolean"
            && (o_typeHelper.test(this._verificationCode, "NOT_EMPTY_STRING") || null);
    }
    /**
    * Update the persistent booking.
    * @returns {Booking} Returns the booking after it has been updated.
    * @throws Throws an error if the booking is invalid or there has been a database error.
    */
    update() {
        return f_updateDataRowFromBooking(this);
    }

    /**
    * Delete the persistent booking on the database and associated visitors.
    * If an error is thrown during the deletion of the visitors, booking will not be deleted.
    * @returns {undefined} Returns after deletion is successfull.
    * @throws Throws an error if there is a database error or the booking no longer exist on the db.
    */
    async delete() {
        try {
            await this.getVisitor().delete(); // Wait for error so we dont delete booking if visitor was not deleted
        }
        catch (err) {
            console.log("Did not delete Booking due to Error during deletion of visitor")
            throw (err);
        }
        return o_dbBookings.delete(this._id);
    }

    /**
    * Redeem a booking that is not redeemed, using its verification code. After successfull verification the booking will be made persistent with the status of being redeemed.
    * @returns {boolean} Returns true if booking is successfully redeemed, returns false if it was already redeemed
    * @throws Throws an error if there is a database error.
    */
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
// Handles conversion between Booking Instances and their persistent counterparts (here data representing a Booking on the database)
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
/**
 * Creates an instance of Booking (as well as its persistent counterpart on the database).
 * @param {Match} match - An instance of the match class, that represent a valid match. 
 * @param {Visitor} visitor - An instance of the visitor class, that represents a valid visitor.
 * @throws {Error} - Throws an "INVALID" Error if the used attributes would create an invalid booking.
 * @returns {Booking} - A booking
 */
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
    catch (error) {
        try {
            await o_booking.delete();
        }
        catch (rollBackError) {
            console.log("Rollback Error: Booking ", o_booking.getId(), "was saved with incomplete / wrong data");
        }
        throw (error);
    }

    return o_booking;
}
/**
 * Check if data would create a valid booking.
 * @param {Match} match - An instance of the match class, that represent a valid match. 
 * @param {Visitor} visitor - An instance of the visitor class, that represents a valid visitor.
 * @return {boolean} Returns true if all attributes are valid otherwise returns false.
 */
function f_checkConstructorData(match, visitor) {
    return (match.isValid() && visitor.isValid())
}

/**
 * Get booking for given id
 * @param {number} id - Id of a booking
 * @returns {Booking|null} - A booking or null if no booking is found
 */
async function f_getBooking(id) {
    const o_bookingData = await o_dbBookings.get(id);
    if (o_bookingData === undefined) {
        return null;
    }
    return f_loadBookingFromDataRow(o_bookingData);
}

/**
 * Get all bookings for the given match.
 * @param {Match} match - An instance of the Match class
 * @returns {Array<Booking>} - Array with all bookings for the match
 */
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

/**
 * Get redeemed bookings for the given match.
 * @param {Match} match - An instance of the Match class
 * @returns {Array<Booking>} - Array with redeemed bookings for the match
 */
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

/**
 * Get all bookings that have been saved on the database.
 * @returns {Array<Booking>}
 */
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

/**
 * Get all redeeemed bookings that have been saved on the database.
 * @returns {Array<Booking>}
 */
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

/**
 * Get booking for given verificationCode
 * @param {string} verificationCode - the verification Code of a booking
 * @returns {Booking|null} - A booking or null if no booking is found
 */
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
