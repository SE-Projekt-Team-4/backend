const o_bookingManager = require("./bookingManager");
const o_visitorManager = require("./visitorManager");
const o_dbMatches = require("../../database/DBConnector_Final").matchQueries;
const o_typeHelper = require("../typeHelper");


class Match {

    constructor(id, opponent, date, maxSpaces, isCancelled) {
        this._id = id;
        this._opponent = opponent;
        this._date = date;
        this._maxSpaces = maxSpaces;
        this._isCancelled = (isCancelled === true);
    }

    setOpponent(opponent) {
        this._opponent = opponent;
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }

    setDateTime(date) {
        this._date = date;
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }

    setDateTimeFromString(dateTimeString) {
        this._date = o_typeHelper.convertToDate(dateTimeString);
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }

    setMaxSpaces(maxSpaces) {
        this._maxSpaces = maxSpaces;
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }

    setIsCancelled(isCancelled) {
        this._isCancelled = isCancelled;
        if (this.isValid() === false) {
            throw new Error("INVALID");
        }
    }

    getId() {
        return this._id;
    }

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

    isValid() {
        return o_typeHelper.test(this._id, "POSITIVE_INT")
            && o_typeHelper.test(this._opponent, "NOT_EMPTY_STRING")
            && o_typeHelper.test(this._date.toISOString(), "DATE_TIME_STRING")
            && o_typeHelper.test(this._maxSpaces, "POSITIVE_INT")
            && typeof this._isCancelled === "boolean";
    }

    update() {
        return f_updateDataRowFromMatch(this);
    }

    delete() {
        return o_dbMatches.delete(this._id);
    }

    async delete(isToDeleteBookings) {
        if (isToDeleteBookings !== false) {
            const a_bookings = await this.getBookings();
            try {
                await Promise.all(a_bookings.map( // Wait for deletion of all Bookings for match
                    (booking) => {
                        booking.delete(true);
                    }
                ));
            }
            catch (err) {
                console.log("Did not delete Match due to error during deletion of Bookings")
                throw (err);
            }
        }
        return o_dbMatches.delete(this._id);
    }

    getBookings() {
        return o_bookingManager.getAllForMatch(this);
    }

    getRedeemedBookings() {
        return o_bookingManager.getRedeemedForMatch(this);
    }

    async getFreeSpaces() {
        return this._maxSpaces - await o_dbMatches.getNumberOfBookings(this._id);
    }

}


// Private Section --------------------------------------------------------------------------------------------------
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
async function f_createMatch(opponent, dateTimeString, maxSpaces, isCancelled) {

    if (o_typeHelper.test(opponent, "NOT_EMPTY_STRING")
        && o_typeHelper.test(dateTimeString, "DATE_TIME_STRING")
        && o_typeHelper.test(maxSpaces, "POSITIVE_INT")
        && typeof isCancelled === "boolean") {

        const o_date = o_typeHelper.convertToDate(dateTimeString);

        const o_matchData = await o_dbMatches.create(opponent, o_date.toISOString(), maxSpaces, isCancelled);
        return f_convertDataRowToMatch(o_matchData);
    }
    else {
        throw new Error("INVALID");
    }
}

async function f_getMatch(id) {
    const o_matchData = await o_dbMatches.get(id);
    if (o_matchData === undefined) {
        return null;
    }
    return f_convertDataRowToMatch(o_matchData);
}

async function f_getAllMatches() {

    const a_matchData = await o_dbMatches.getAll();

    return a_matchData.map(
        (matchData) => {
            return f_convertDataRowToMatch(matchData);
        }
    );
}

async function f_getMatchesBefore(date) {
    const a_matchData = await o_dbMatches.getMatchesBeforeDateTimeString(date.toISOString());

    return a_matchData.map(
        (matchData) => {
            return f_convertDataRowToMatch(matchData);
        }
    );
}

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
module, exports.getFirstAfter = f_getFirstMatchAfter;