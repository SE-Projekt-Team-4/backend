
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

let db = new sqlite3.Database(path.join(__dirname, '.', 'SE.db'),
    sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) {
            console.log(err)
        }
    });
//===================================================================================================================



// Booking Queries --------------------------------------------------------------------------------------------------

function f_createBooking(matchId, visitorId, isRedeemed, verificationCode) {

    return new Promise(
        (success, reject) => {
            db.run('Insert into Booking(MATCH_ID,Visitor_ID,IS_REDEEMED,VERIFICATION_CODE) values (?,?,?,?)',
                [matchId, visitorId, isRedeemed, verificationCode], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getBooking(this.lastID)
                        .then(success)
                        .catch(reject);
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
                    return;
                }
                success(row);
            });
        }
    );
}

function f_getBookingsByMatchId(matchId) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Booking where MATCH_ID =?', [matchId], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}

function f_getAllBookings() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Booking', [], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}

function f_getAllBookingsRedeemed() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from booking where Is_Redeemed = 1',
            [], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}

function f_getRedeemedBookingsByMatchId(matchID) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from booking where Match_ID =? and Is_Redeemed = 1',
                [matchID], function (err, rows) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    success(rows);

                });
        }
    );
}

function f_getBookingsByVerificationCode(verificationCode) {
    return new Promise(
        (success, reject) => {
            db.get('Select * from Booking where VERIFICATION_CODE =?', [verificationCode], function (err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                success(row);

            });
        }
    );
}

function f_updateBooking(id, matchId, visitorId, isRedeemed, verificationCode) {
    return new Promise(
        (success, reject) => {
            db.run('Update Booking set MATCH_ID= ?, Visitor_ID = ? , Is_Redeemed= ?, Verification_Code= ? where id =?',
                [matchId, visitorId, isRedeemed, verificationCode, id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getBooking(id)
                        .then(success)
                        .catch(reject);
                });
        }
    );
}

function f_deleteBooking(id) {
    return new Promise(
        (success, reject) => {
            db.run('Delete from Booking where id = ?', [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                success();
                return;
            });
        }
    );
}

//-------------------------------------------------------------------------------------------------------------------


// Match Queries ----------------------------------------------------------------------------------------------------

function f_createMatch(opponent, dateTime, maxSpaces, isCancelled) {
    return new Promise(
        (success, reject) => {
            db.run('Insert into Match(Max_Spaces,Opponent,Date_Time,Is_Cancelled) values (?,?,?,?)',
                [maxSpaces, opponent, dateTime, isCancelled], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getMatch(this.lastID)
                        .then(success)
                        .catch(reject);
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
                    return;
                }
                success(row);

            });
        }
    );
}
function f_getMatchesBeforeDateTimeString(datetime) {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Match where Date_Time <?', [datetime], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}
function f_getMatchFirstAfterDateTimeString(datetime) {
    return new Promise(
        (success, reject) => {
            db.get('Select ID, OPPONENT, MIN(DATE_TIME) as DATE_TIME, MAX_SPACES, IS_CANCELLED from Match where Date_Time >? Limit 1', [datetime], function (err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                success(row);

            });
        }
    );
}

function f_getAllMatches() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from Match', function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}

function f_updateMatch(id, opponent, dateTime, maxSpaces, isCancelled) {
    return new Promise(
        (success, reject) => {
            db.run('Update match set Max_Spaces= ?, Opponent = ?, Date_Time= ?, Is_Cancelled= ? where id =?',
                [maxSpaces, opponent, dateTime, isCancelled, id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getMatch(id)
                        .then(success)
                        .catch(reject);
                });
        }
    );
}

function f_deleteMatch(id) {
    // TODO: NOT SUPPORTED
    return new Promise(
        (success, reject) => {
            db.run('Delete from Match where ID = ?', [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                success();
                return;
            });
        }
    );
}

function f_getNumberOfBookings(matchID) {
    return new Promise(
        (success, reject) => {
            db.get('Select Count(Distinct Visitor_ID) as COUNT from Booking where MATCH_ID = ?', [matchID], function (err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                success(row['COUNT']);

            });
        }
    );
}

//-------------------------------------------------------------------------------------------------------------------


// Visitor Queries --------------------------------------------------------------------------------------------------

function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {

    return new Promise(
        (success, reject) => {
            db.run('Insert into visitor(F_Name,L_Name,City,Postcode,Street,House_Number,Phone_Number,E_mail) values (?,?,?,?,?,?,?,?)',
                [fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getVisitor(this.lastID)
                        .then(success)
                        .catch(reject);
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
                    return;
                }
                success(row);

            });
        }
    );
}

function f_getAllVisitors() {
    return new Promise(
        (success, reject) => {
            db.all('Select * from visitor', function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                success(rows);

            });
        }
    );
}

function f_updateVisitor(id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    return new Promise(
        (success, reject) => {
            db.run('Update visitor set F_Name = ?, L_Name = ? , City = ?, Postcode = ?, Street =?, House_number = ?, Phone_number= ?, E_mail=? where id =?',
                [fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail, id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    f_getVisitor(id)
                        .then(success)
                        .catch(reject);
                });
        }
    );
}

function f_deleteVisitor(id) {
    return new Promise(
        (success, reject) => {
            db.run('Delete from visitor where ID =?', [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                success();
                return;
            });
        }
    );


}


const o_visitorQueries = {
    create: f_createVisitor,
    get: f_getVisitor,
    getAll: f_getAllVisitors,
    update: f_updateVisitor,
    delete: f_deleteVisitor
}

const o_bookingQueries = {
    create: f_createBooking,
    get: f_getBooking,
    getAll: f_getAllBookings,
    getRedeemed: f_getAllBookingsRedeemed,
    getByMatchId: f_getBookingsByMatchId,
    getRedeemedByMatchId: f_getRedeemedBookingsByMatchId,
    update: f_updateBooking,
    delete: f_deleteBooking,
    getByVerificationCode: f_getBookingsByVerificationCode,
}

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

module.exports.bookingQueries = o_bookingQueries;
module.exports.matchQueries = o_matchQueries;
module.exports.visitorQueries = o_visitorQueries;

