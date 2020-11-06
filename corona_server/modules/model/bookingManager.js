
class Booking {

    static _generateVerificationCode(id) {
        const s_verification = ("000" + Math.floor(Math.random() * 5833).toString(18)).slice(-3).toUpperCase();
        const s_idPart = ("000000000" + id).slice(-9);
        return(s_idPart + s_verification);
    }

    // This is a private constructor and should not be exported
    constructor(id, matchDay, visitor, isRedeemed, verificationCode) {
        this._id = id;
        this._matchDay = matchDay;
        this._visitor = visitor;
        this._isRedeemed = isRedeemed;
        this._verificationCode = verificationCode;
    }

    update() {
        if (this._id == undefined) {
            throw new Error("Critical Programming Error - No id found");
        }
        console.log("update to db");
        return this;
    }

    delete() {
        if (this.id !== null) {
            console.log("Delete row in db");
        } 
    }

    getVerificationCode() {
        return this._verificationCode;
    }

    redeem() {
        this._isRedeemed = true;
    }

}

function f_createBooking(matchDay, visitor) {
    const b_isRedeemed = false;
    // Save to db - get Id 
    const s_verificationCode = Booking._generateVerificationCode()
    const id = 5
return new Booking(id, matchDay, visitor, b_isRedeemed, s_verificationCode);
}

function f_getBooking(id) {
// Get from db
return new Booking();
}

module.exports.create = f_createBooking;
module.exports.get = f_getBooking;
