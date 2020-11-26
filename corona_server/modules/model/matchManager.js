const o_bookingManager = require ("./bookingManager");
const o_dbMatches = require ("../dbConectorDummy").matchQueries;

var matches;


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
        o_dbMatches.update(this._id, this._opponent, this._dateTime, this._maxSpaces, this._isCancelled);
        return this;
    }

    delete() {
        o_dbMatches.delete(this._id);
    }

    getData() {
        return {
            id : this._id,
            opponent : this._opponent,
            dateTime : this._dateTime,
            maxSpaces : this._maxSpaces,
            isCancelled : this._isCancelled,
            freeSpaces : this.getFreeSpaces()
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
}


// Private Section --------------------------------------------------------------------------------------------------
function f_loadMatchFromDataRow(matchData) {
    return new Match(matchData.ID, matchData.OPPONENT, matchData.DATE_TIME, matchData.MAX_SPACES, matchData.IS_CANCELLED);
}

//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createMatch(opponent, dateTime, maxSpaces, isCancelled) {
    const o_matchData = o_dbMatches.create(opponent, dateTime, maxSpaces, isCancelled);
    return f_loadMatchFromDataRow(o_matchData);
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
        (o_matchData)=>{
            a_matches.push(f_loadMatchFromDataRow(o_matchData));
        });        
    return a_matches;
}


module.exports.create = f_createMatch;
module.exports.getById = f_getMatch;
module.exports.getAll = f_getAllMatches;