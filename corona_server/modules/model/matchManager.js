/**
 * @module matchManager
 */

const o_bookingManager = require("./bookingManager");
const o_dbMatches = require("../../database/DBConnector_Final").matchQueries;
const o_typeHelper = require("../typeHelper");

/** Class representing a match. As only instances of this class are exported, the constructor is not visible from outside the module*/
class Match {

    constructor(id, opponent, date, maxSpaces, isCancelled) {
        this._id = id;
        this._opponent = opponent;
        this._date = date;
        this._maxSpaces = maxSpaces;
        this._isCancelled = (isCancelled === true);
    }

    /**
    * Change the opponent.
    * @param {string} opponent
    */
    setOpponent(opponent) {
        this._opponent = opponent;
    }
    /**
    * Change the date.
    * @param {Date} date
    */
    setDateTime(date) {
        this._date = date;
    }
    /**
    * Change the date using a dateTimeString.
    * @param {Date} dateTimeString - A String that represents a date using the full z-variation UTC ISO8601 Date
    * @throws Throws if dateTimeString is in the wrong format
    */
    setDateTimeFromString(dateTimeString) {
        this._date = o_typeHelper.convertToDate(dateTimeString);
    }
    /**
    * Change the number of max spaces, if the new number of max spaces is lower than the number of bookings for this match, no changes are made.
    * @param {number} maxSpaces - New number of max spaces after check of number of bookings.
    * @returns {number|null} Returns the number of Spaces after the update, if the update is not made return null instead
    * @throws Throws database errors.
    */
    async setMaxSpaces(maxSpaces) {
        const n_bookings = await o_dbMatches.getNumberOfBookings(this._id);
        if( maxSpaces < n_bookings){
            return null;
        }
        this._maxSpaces = maxSpaces;
        return this._maxSpaces;
    }
    /**
    * Change whether the match is cancelled.
    * @param {boolean} isCancelled 
    */
    setIsCancelled(isCancelled) {
        this._isCancelled = isCancelled;
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }
    /**
    * Getter for Id.
    * @returns {number} Id of this match
    */
    getId() {
        return this._id;
    }
    /**
    * Returns info describing this match.
    * @returns {object} Object describing this match.
    */
    async loadInfo() {
        return {
            id: this._id,
            opponent: this._opponent,
            date: this._date.toISOString(),
            maxSpaces: this._maxSpaces,
            isCancelled: this._isCancelled,
            freeSpaces: await this.getFreeSpaces()
        }
    }
    /**
    * Returns true if this match is valid.
    * @returns {boolean} True if this match is valid, otherwise false.
    */
    isValid() {
        return o_typeHelper.test(this._id, "POSITIVE_INT")
            && o_typeHelper.test(this._opponent, "NOT_EMPTY_STRING")
            && o_typeHelper.test(this._date.toISOString(), "DATE_TIME_STRING")
            && o_typeHelper.test(this._maxSpaces, "POSITIVE_INT")
            && typeof this._isCancelled === "boolean";
    }
    /**
    * Update the match saved on the database.
    * @returns {Match} Returns the match after it has been updated.
    * @throws Throws an error if the match is invalid or there has been a database error.
    */
    async update() {
        return f_updateDataRowFromMatch(this);
    }
    /**
    * Delete the match saved on the database and associated bookings.
    * If an error is thrown during the deletion of the bookings, match will not be deleted.
    * @returns {undefined} Returns after deletion is successfull.
    * @throws Throws an error if there is a database error or the match no longer exist on the db.
    */
    async delete() {
        const a_bookings = await this.getBookings();
        try {
            await Promise.all(a_bookings.map( // Wait for deletion of all Bookings for match
                (booking) => {
                    booking.delete();
                }
            ));
        }
        catch (err) {
            console.log("Did not delete Match due to error during deletion of Bookings")
            throw (err);
        }
        return o_dbMatches.delete(this._id);
    }
    /**
    * Returns all bookings for this match.
    * @returns {Array<Bookings>} Returns when bookings have been loaded.
    * @throws  Throws an error if there is a db error or match is not found on db.
    */
    async getBookings() {
        return o_bookingManager.getAllForMatch(this);
    }
    /**
    * Returns redeemed bookings for this match.
    * @returns {Array<Bookings>} Returns when bookings have been loaded.
    * @throws  Throws an error if there is a db error or match is not found on db.
    */
    async getRedeemedBookings() {
        return o_bookingManager.getRedeemedForMatch(this);
    }
    /**
    * Returns the number of free spaces left for a match.
    * @returns {number} Returns after number of free spaces have been calculated.
    * @throws  Throws an error if there is a db error or match is not found on db.
    */
    async getFreeSpaces() {
        return this._maxSpaces - await this.getNumberOfBookings();
    }
    /**
    * Returns the number of bookings for a match.
    * @returns {number} Returns after number of free spaces have been calculated.
    * @throws  Throws an error if there is a db error or match is not found on db.
    */
   async getNumberOfBookings() {
    return o_dbMatches.getNumberOfBookings(this._id);
}

}


// Private Section --------------------------------------------------------------------------------------------------
// Handles conversion between Match Instances and data representing a Match on the database
function f_convertDataRowToMatch(matchData) {

    const o_date = o_typeHelper.convertToDate(matchData.DATE_TIME)

    const o_match = new Match(matchData.ID, matchData.OPPONENT, o_date, matchData.MAX_SPACES, (matchData.IS_CANCELLED != 0));

    if (o_match.isValid()) {
        return o_match;
    }
    else {
        throw new Error("INVALID");
    }

}

async function f_updateDataRowFromMatch(match) {
    if (!match.isValid()) {
        throw new Error("INVALID");
    }
    const o_matchData = await o_dbMatches.update(match._id, match._opponent, match._date.toISOString(), match._maxSpaces, match._isCancelled);
    match._id = o_matchData.ID;
    match._opponent = o_matchData.OPPONENT;
    match._date = o_typeHelper.convertToDate(o_matchData.DATE_TIME);
    match._maxSpaces = o_matchData.MAX_SPACES;
    match._isCancelled = (o_matchData.IS_CANCELLED != 0);
    return match;
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
/**
 * Create a Match.
 * @param {number} id - Id of the match. 
 * @param {string} opponent - Opponent that the match is against.
 * @param {string} dateTimeString - A string that represents the dateTime of the match.
 * @param {number} maxSpaces - The max amount of spaces.
 * @param {boolean} isCancelled - Whether the match is cancelled.
 * @throws {Error} - Throws an "INVALID" Error if the used attributes would create an invalid match.
 * @returns {Match} - A match
 */
async function f_createMatch(opponent, dateTimeString, maxSpaces, isCancelled) {

    if (!(o_typeHelper.test(opponent, "NOT_EMPTY_STRING")
        && o_typeHelper.test(dateTimeString, "DATE_TIME_STRING")
        && o_typeHelper.test(maxSpaces, "POSITIVE_INT")
        && typeof isCancelled === "boolean")) {
        throw new Error("INVALID");
    }

    const o_date = o_typeHelper.convertToDate(dateTimeString);

    const o_matchData = await o_dbMatches.create(opponent, o_date.toISOString(), maxSpaces, isCancelled);
    return f_convertDataRowToMatch(o_matchData);
}
/**
 * Check if data would create a valid match.
 * @param {string} opponent - Opponent that the match is against. Must transform into string implicitly and not be empty to be valid.
 * @param {dateTimeString} dateTimeString - DateTimeString that represents the start of the match. Must be ISO 8601 full version UTC Z-variation to be valid.
 * @param {number} maxSpaces - The max amount of spaces. Must be a positive int to be valid.
 * @param {boolean} isCancelled - Whether the match is cancelled. Must be a boolean to be valid.
 * @return {boolean} Returns true if all attributes are valid otherwise returns false.
 */
function f_checkConstructorData(opponent, dateTimeString, maxSpaces, isCancelled) {
    return (o_typeHelper.test(opponent, "NOT_EMPTY_STRING")
        && o_typeHelper.test(dateTimeString, "DATE_TIME_STRING")
        && o_typeHelper.test(maxSpaces, "POSITIVE_INT")
        && typeof isCancelled === "boolean")
}

/**
 * Get match for given id
 * @param {number} id - Id of a match
 * @returns {Match|null} - A match or null if no match is found
 */
async function f_getMatch(id) {
    const o_matchData = await o_dbMatches.get(id);
    if (o_matchData === undefined) {
        return null;
    }
    return f_convertDataRowToMatch(o_matchData);
}
/**
 * Get all matches from the database.
 * @returns {Array<Match>}
 */
async function f_getAllMatches() {

    const a_matchData = await o_dbMatches.getAll();

    return a_matchData.map(
        (matchData) => {
            return f_convertDataRowToMatch(matchData);
        }
    );
}
/**
 * Get all matches that start earlier than the given date.
 * @param {Date} date - A date object
 * @returns {Array<Match>} - Array with all Matches before the given date
 */
async function f_getMatchesBefore(date) {
    const a_matchData = await o_dbMatches.getMatchesBeforeDateTimeString(date.toISOString());

    return a_matchData.map(
        (matchData) => {
            return f_convertDataRowToMatch(matchData);
        }
    );
}
/**
 * Get the first match that starts after the given date
 * @param {Date} date - A date object
 * @returns {Match|null} - A Match after the date or null if no match is found
 */
async function f_getFirstMatchAfter(date) {
    const o_matchData = await o_dbMatches.getMatchFirstAfterDateTimeString(date.toISOString());
    if (o_matchData === undefined) {
        return null;
    }
    return f_convertDataRowToMatch(o_matchData);
}


module.exports.create = f_createMatch;
module.exports.getById = f_getMatch;
module.exports.getAll = f_getAllMatches;
module.exports.getBefore = f_getMatchesBefore;
module.exports.getFirstAfter = f_getFirstMatchAfter;
module.exports.checkData = f_checkConstructorData;
