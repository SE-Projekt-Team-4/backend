const o_bookingManager = require("./bookingManager");
const o_dbMatches = require("../dbConectorDummy").matchQueries;
const o_typeHelper = require("../typeHelper");


class Match {

    constructor(id, opponent, dateTime, maxSpaces, isCancelled) {
        this._id = id;
        this._opponent = opponent;
        this._dateTime = dateTime;
        this._maxSpaces = maxSpaces;
        this._isCancelled = (isCancelled === true);
    }

    getId() {
        return this._id;
    }

    update() {
        if (this.isValid()) {
            o_dbMatches.update(this._id, this._opponent, this._dateTime, this._maxSpaces, this._isCancelled);
            return this;
        }
        else {
            throw new TypeError("One or more Invalid Attributes");
        }
    }

    delete() {
        o_dbMatches.delete(this._id);
    }

    getData() {
        return {
            id: this._id,
            opponent: this._opponent,
            dateTime: this._dateTime.toISOString(),
            maxSpaces: this._maxSpaces,
            isCancelled: this._isCancelled,
            freeSpaces: this.getFreeSpaces()
        }
    }

    getBookings() {
        return o_bookingManager.getAllForMatch(this);
    }

    getVisitors() {
        var a_visitors = [];
        this.getBookings().forEach(
            (o_booking) => {
                a_visitors.push(o_booking.getVisitor());
            });
        return a_visitors;
    }

    getFreeSpaces() {
        return this._maxSpaces - o_dbMatches.getNumberOfBookings(this._id);
    }

    isValid() {
        return o_typeHelper.test("POSITIVE_INT", this._id)
            && o_typeHelper.test("NOT_EMPTY_STRING", this._opponent)
            && o_typeHelper.test("DATE_TIME_STRING", this._dateTime.toISOString())
            && o_typeHelper.test("POSITIVE_INT", this._maxSpaces)
            && typeof this._isCancelled === "boolean";
    }
}


// Private Section --------------------------------------------------------------------------------------------------
function f_loadMatchFromDataRow(matchData) {

    const o_date = o_typeHelper.convertToDate(matchData.DATE_TIME)  
    const o_match = new Match(matchData.ID, matchData.OPPONENT, o_date, matchData.MAX_SPACES, matchData.IS_CANCELLED);
    
    if (o_match.isValid()) {
        return o_match;
    }
    else {
        throw new TypeError("One or more Invalid Attributes");
    }

}

//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createMatch(opponent, dateTime, maxSpaces, isCancelled) {

    if (o_typeHelper.test("NAME", opponent)
        && o_typeHelper.test("DATE_TIME_STRING", dateTime)
        && o_typeHelper.test("POSITIVE_INT", maxSpaces)
        && typeof isCancelled === "boolean") {

        const o_date = o_typeHelper.convertToDate(matchData.dateTime);   

        const o_matchData = o_dbMatches.create(opponent, o_date, maxSpaces, isCancelled);
        return f_loadMatchFromDataRow(o_matchData);
    }
    else {
        throw new TypeError("One or more Invalid Parameters");
    }
}

function f_getMatch(id) {
    const o_matchData = o_dbMatches.get(id);
    if (o_matchData === null) {
        return null;
    }
    return f_loadMatchFromDataRow(o_matchData);
}

function f_getAllMatches() {
    const a_matchData = o_dbMatches.getAll();
    const a_matches = [];

    a_matchData.forEach(
        (o_matchData) => {
            a_matches.push(f_loadMatchFromDataRow(o_matchData));
        });
    return a_matches;
}


module.exports.create = f_createMatch;
module.exports.getById = f_getMatch;
module.exports.getAll = f_getAllMatches;