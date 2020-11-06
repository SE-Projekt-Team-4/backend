const f_createVisitor = require('./model/visitorManager').create;
const f_createBooking = require('./model/bookingManager').create;
const f_getMatchDay = require('./model/matchManager').get;

class Form {



    constructor(matchDay) {
        this._matchDay = matchDay;
        this._key = "";
        this._timer = "";
    }

    book(fName, lName, city, postcode, street, houseNumber) {
        const o_visitor = f_createVisitor(fName, lName, city, postcode, street, houseNumber);
        const o_booking = f_createBooking(this._matchDay, o_visitor);
    }

}

const o_matchDay = f_getMatchDay(1);
new Session(o_matchDay).book("a","b","c","d","e","f");