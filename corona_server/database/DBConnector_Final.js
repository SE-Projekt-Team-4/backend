//===================================================================================================================

// TODO: Init DB
const sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('./SE.db',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.log(err)
        }
    });

//===================================================================================================================



function f_convertBooking(v) {
    return {
        ID: v[0],
        MATCH_ID: v[1],
        VISITOR_ID: v[2],
        IS_REDEEMED: v[3],
        VERIFICATION_CODE: v[4]
    }
}

function f_convertMatch(v) {
    return {
        ID: v[0],
        OPPONENT: v[1],
        DATE_TIME: v[2],
        MAX_SPACES: v[3],
        IS_CANCELLED: v[4]
    }
}

function f_convertVisitor(v) {
    return {
        ID: v[0],
        F_NAME: v[1],
        L_NAME: v[2],
        CITY: v[3],
        POSTCODE: v[4],
        STREET: v[5],
        HOUSE_NUMBER: v[6],
        PHONE_NUMBER: v[7],
        E_MAIL: v[8]
    }
}

// Booking Queries --------------------------------------------------------------------------------------------------

// Dummy Data 
// Boolean gibts nicht in SQLite -> int 1 = true, 0 = false;
var bookings = [
    [0, 0, 1, false, "000000000A2B"],
    [1, 0, 2, false, "000000001A22"],
    [2, 0, 3, false, "000000002BDD"],
    [3, 1, 4, false, "000000003C2A"],
    [4, 1, 5, false, "000000004002"],
    [5, 2, 6, false, "00000000507A"]
]

function f_createBooking(matchId, visitorId, isRedeemed, verificationCode) {

    return new Promise(
        (success, reject) => {
            db.run('Insert into Booking(MATCH_ID,Visitor_ID,IS_REDEEMED,VERIFICATION_CODE) values (?,?,?,?)', [matchId, visitorId, isRedeemed, verificationCode], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getBooking(id) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from Booking where ID =?', [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getBookingsByMatchId(matchId) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from Booking where MATCH_ID =?', [matchId], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getBookingsByVerificationCode(verificationCode) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Booking where VERIFICATION_CODE =?', [verificationCode], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_updateBooking(id, matchId, visitorId, isRedeemed, verificationCode) {
    return new Promise(
        (success, reject) => {
            db.run('Update Booking set MATCH_ID= ?, Visitor_ID = ? , Is_Redeemed= ?, Verification_Code= ? where id =?', [matchId, visitorId, isRedeemed, verificationCode, id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_deleteBooking(id) {
    return new Promise(
        (success, reject) => {
            db.run('Delete from Booking where id = ?', [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

//-------------------------------------------------------------------------------------------------------------------


// Match Queries ----------------------------------------------------------------------------------------------------

//Dummy Data -> Boolean mit int also 0 = false, 1 = true
var matches = [
    [0, "Schalke 04", "2007-12-12T19:21:00.000Z", 1000, false],
    [1, "Mannheim", "2007-12-11T20:21:00.000Z", 200, false],
    [2, "Frauheim", "2007-12-20T08:21:00.000Z", 300, true],
    [3, "Burg", "2007-12-08T09:00:00.000Z", 330, true],
    [4, "Hinterdorf", "2007-12-04T18:21:00.000Z", 222, false],
    [5, "Vorderdorf", "2007-12-02T18:21:00.000Z", 666, false],
    [6, "Neckarstadt", "2007-12-08T18:21:00.000Z", 300, false]
];
//ID automatisiert>?
function f_createMatch(opponent, dateTime, maxSpaces, isCancelled) {
    n_id = matches.length;
    return new Promise(
        (success, reject) => {
            db.run('Insert into Match(Max_Spaces,Opponent,Date_Time,Is_Cancelled) values (?,?,?,?)', [maxSpaces, opponent, dateTime, isCancelled], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getMatch(id) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from Match where ID =?', [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}
function f_getMatchesBeforeDateTimeString(datetime) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Match where Date_Time <?', [datetime], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}
function f_getMatchFirstAfterDateTimeString(datetime) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from Match where Date_Time >? Limit 1', [datetime], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getAllMatches() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Match', function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_updateMatch(id, opponent, dateTime, maxSpaces, isCancelled) {
    return new Promise(
        (success, reject) => {
            db.run('Update match set Max_Spaces= ?, Opponent = ? Date_Time= ?, Is_Cancelled= ? where id =?', [maxSpaces, opponent, dateTime, isCancelled, id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_deleteMatch(matchID) {
    // TODO: NOT SUPPORTED
    return new Promise(
        (success, reject) => {
            db.run('Delete from Match where MATCH_ID = ?', [matchID], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getNumberOfBookings(matchID) {
    return new Promise(
        (success, reject) => {
            db.get('Select Count(Distinct Visitor_ID) from Booking where MATCH_ID = ?', [matchID], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
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

//ID auto-increment prüfen
function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {

    return new Promise(
        (success, reject) => {
            db.run('Insert into visitor(F_Name,L_Name,City,Postcode,Street,House_Number,Phone_Number,E_mail) values (?,?,?,?,?,?,?,?)', [fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail], function (err, row) {
                if (err) {
                    reject(err);
                }
                else{
                    success(row);
                }

            });
        }
    );
}

function f_getVisitor(id) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from visitor where ID =?', [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getAllVisitors() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from visitor', function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_getAllActualVisitors(matchID) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from visitor inner join booking on booking.VISITOR_ID = visitor.ID where Match_ID =? and Is_Redeemed = 1', [matchID], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}


function f_updateVisitor(id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    return new Promise(
        (success, reject) => {
            db.run('Update visitor set F_Name = ?, L_Name = ? , City = ?, Postcode = ?, Street =?, House_number = ?, Phone_number= ?, E_mail=? where id =?', [fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail, id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );
}

function f_deleteVisitor(id) {
    // TODO: Gibt Undefined zurück aber funktioniert.
    return new Promise(
        (success, reject) => {
            db.run('Delete from visitor where ID =?', [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                success(row);

            });
        }
    );


}
// Kann das weg?
const o_visitorQueries = {
    create: f_createVisitor,
    get: f_getVisitor,
    getAll: f_getAllVisitors,
    getRedeemed: f_getAllActualVisitors,
    update: f_updateVisitor,
    delete: f_deleteVisitor
}


//Warum ist die letzte Zeile blau?
const o_bookingQueries = {
    create: f_createBooking,
    get: f_getBooking,
    getByMatchId: f_getBookingsByMatchId,
    update: f_updateBooking,
    delete: f_deleteBooking,
    getByVerificationCode: f_getBookingsByVerificationCode,
}

// Ist das Coder oder kann das weg?
const o_matchQueries = {
    create: f_createMatch,
    get: f_getMatch,
    getAll: f_getAllMatches,
    update: f_updateMatch,
    delete: f_deleteMatch,
    getNumberOfBookings: f_getNumberOfBookings,
    getMatchesBeforeDateTimeString: f_getMatchesBeforeDateTimeString,
    getMatchFirstAfterDateTimeString: f_getMatchFirstAfterDateTimeString
}

//-------------------------------------------------------------------------------------------------------------------
// f_getVisitor(1)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_deleteVisitor(2)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getAllVisitors()
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_createVisitor( "Dieter", "Peter", "Mheim", 68161, "S7", 6, "071363935", "mail@mail.com")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_updateVisitor(7, "Hans Jürgen", "Peter", "Mannheim", 68161, "S6", 16, "071363935", "mail@mail.com")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });


// f_createMatch( "Hamburger SV", "2007-12-12T19:22:00.000Z", 1000, 0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_updateMatch(0, "Schalke 004", "2007-12-12T19:21:00.000Z", 1000, 0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });


// f_createBooking( 0, 0, 0, "100000000A2B")
//     .then((row) => {
//         console.log(row); 
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_deleteBooking(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.error(error);
//     });

// f_updateBooking(2, 0, 2, 1, "100000000A2B")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_deleteMatch(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getAllMatches()
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getMatch(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getBookingsByMatchId(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getBooking(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getBookingsByVerificationCode("000000000A2B")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getMatchesBeforeDateTimeString("2007-12-12T19:21:01.000Z")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });


// f_getMatchFirstAfterDateTimeString("2007-12-12T19:20:00.000Z")
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// f_getAllActualVisitors(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });


// f_getNumberOfBookings(0)
//     .then((row) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

module.exports.bookingQueries = o_bookingQueries;
module.exports.matchQueries = o_matchQueries;
module.exports.visitorQueries = o_visitorQueries;

