//===================================================================================================================

// TODO: Init DB


//===================================================================================================================

// Helper

function f_convertBooking(v) {
    return {
        ID : v[0],
        MATCH_ID : v[1],
        VISITOR_ID : v[2],
        IS_REDEEMED : v[3],
        VERIFICATION_CODE : v[4]
    }
}

function f_convertMatch(v) {
    return {
        ID : v[0],
        OPPONENT : v[1],
        DATE_TIME : v[2],
        MAX_SPACES : v[3],
        IS_CANCELLED : v[4]
    }
}

function f_convertVisitor(v) {
    return {
        ID : v[0],
        F_NAME : v[1],
        L_NAME : v[2],
        CITY : v[3],
        POSTCODE : v[4],
        STREET : v[5],
        HOUSE_NUMBER : v[6],
        PHONE_NUMBER : v[7],
        E_MAIL : v[8]
    }
}

// Booking Queries --------------------------------------------------------------------------------------------------

// Dummy Data
var bookings = [
    [0, 0, 1, false, "000000000A2B"],
    [1, 0, 2, false, "000000001A22"],
    [2, 0, 3, false, "000000002BDD"],
    [3, 1, 4, false, "000000003C2A"],
    [4, 1, 5, false, "000000004002"],
    [5, 2, 6, false, "00000000507A"]
]

function f_createBooking(matchId, visitorId, isRedeemed, verificationCode) {
    n_id = bookings.length;
    bookings.push([n_id, matchId, visitorId, isRedeemed, verificationCode]);
    return f_convertBooking([n_id, matchId, visitorId, isRedeemed, verificationCode]);
}

function f_getBooking(id) {
    return f_convertBooking(bookings[id]);
}

function f_getBookingsByMatchId(matchId) {
    var results = bookings.filter(obj => {
        return obj[1] === matchId;
      });

    var a = [];
      for (var v in results) {
          a.push(
              f_convertBooking(bookings[v])
          );
      }
      return a;
}

function f_updateBooking(id, matchId, visitorId, isRedeemed, verificationCode) {
    bookings[id] = ([id, matchId, visitorId, isRedeemed, verificationCode]);
    return f_convertBooking([id, matchId, visitorId, isRedeemed, verificationCode]);
}

function f_deleteBooking(id) {

}


const o_bookingQueries = {
    create : f_createBooking,
    get : f_getBooking,
    getByMatchId : f_getBookingsByMatchId,
    update : f_updateBooking,
    delete : f_deleteBooking
}

//-------------------------------------------------------------------------------------------------------------------


// Match Queries ----------------------------------------------------------------------------------------------------

//Dummy Data
var matches = [
    [0, "Schalke 04", "2007-12-24T18:21Z", 3, false],
    [1, "Mannheim", "2007-12-22T18:21Z", 200, false],
    [2, "Frauheim", "2007-12-21T18:21Z", 300, true],
    [3, "Burg", "2007-12-25T18:21Z", 330, true],
    [4, "Hinterdorf", "2007-12-28T18:21Z", 222, false],
    [5, "Vorderdorf", "2007-12-12T18:21Z", 666, false],
    [6, "Neckarstadt", "2007-12-13T18:21Z", 300, false]
];

function f_createMatch(opponent, dateTime, maxSpaces, isCancelled) {
    n_id = matches.length;
    matches.push([n_id, opponent, dateTime, maxSpaces, isCancelled]);
    return f_convertMatch([n_id, opponent, dateTime, maxSpaces, isCancelled]);
}

function f_getMatch(id) {
    if (matches[id] === undefined) {
        return null;
    }
    return f_convertMatch(matches[id]);
}

function f_getAllMatches() {
    var a = [];
    for (var v in matches) {
        a.push(
            f_convertMatch(matches[v])
        );
    }
    return a;
}

function f_updateMatch(id, opponent, dateTime, maxSpaces, isCancelled) {
    matches[id] = ([id, opponent, dateTime, maxSpaces, isCancelled]);
    return f_convertMatch([id, opponent, dateTime, maxSpaces, isCancelled]);
}

function f_deleteMatch(id) {
    // TODO: NOT SUPPORTED
}

function f_getNumberOfBookings(matchId) {
    var n = 0;
    bookings.forEach((a_booking) => {
        if (a_booking[1] === matchId){
            n = n + 1; 
        }
    });
    return n;
}

const o_matchQueries = {
    create : f_createMatch,
    get : f_getMatch,
    getAll : f_getAllMatches,
    update : f_updateMatch,
    delete : f_deleteMatch,
    getNumberOfBookings : f_getNumberOfBookings
}
//-------------------------------------------------------------------------------------------------------------------


// Visitor Queries --------------------------------------------------------------------------------------------------

//Dummy Data
var visitors = [
    [0, "Hans", "Peter", "Mannheim", 68161, "S6", 16, "071363935", "mail@mail.com"],
    [1, "Dieter", "Peter", "Mheim", 68161, "S7", 6, "071363935", "mail@mail.com"],
    [2, "Gerorge", "Muller", "Mheim", 68321, "T6", 8, "071363935", "mail@mail.com"],
    [3, "Dieter", "Pohlen", "Mheim", 6333331, "R6", 10, "071363935", "mail@mail.com"],
    [4, "Klaus", "Gross", "Mannburg", 62221, "Q6", 12, "071363935", "mail@mail.com"],
    [5, "Norbert", "Heinz", "Nurnberg", 683345, "T6", 3, "071363935", "mail@mail.com"],
    [6, "Hans", "Gruber", "Mannheim", 161222, "V6", 16, "071363935", "mail@mail.com"]
]


function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    n_id = visitors.length;
    visitors.push([n_id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail])
    return f_convertVisitor([n_id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail]);
}

function f_getVisitor(id) {
    return f_convertVisitor(visitors[id]);
}

function f_getAllVisitors() {
    var a = [];
    for (var v in visitors) {
        a.push(
            f_convertVisitor(visitors[v])
        );
    }
    return a;
}

function f_updateVisitor(id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    visitors[id] = ([id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail]);
    return f_convertVisitor([id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail]);
}

function f_deleteVisitor(id) {
    // TODO: Implement
}

const o_visitorQueries = {
    create : f_createVisitor,
    get : f_getVisitor,
    getAll : f_getAllVisitors,
    update : f_updateVisitor,
    delete : f_deleteVisitor
}


//-------------------------------------------------------------------------------------------------------------------



module.exports.bookingQueries = o_bookingQueries;
module.exports.matchQueries = o_matchQueries;
module.exports.visitorQueries = o_visitorQueries;