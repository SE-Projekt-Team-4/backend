const o_dbVisitors = require ("../dbConectorDummy").visitorQueries;

class Visitor {

    constructor(id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
        if (Visitor.isId(id) && Visitor.isFName(fName) && Visitor.isLName(lName) &&
            Visitor.isCity(city) && Visitor.isPostCode(postcode) && Visitor.isStreet(street) && Visitor.isHouseNumber(houseNumber)) {
                //TODO: Add email telnum verification
            this._id = id;
            this._fName = fName;
            this._lName = lName;
            this._city = city;
            this._postcode = postcode;
            this._street = street;
            this._houseNumber = houseNumber;
            this._phoneNumber = phoneNumber;
            this._eMail = eMail;
        }
        else {
            throw new TypeError("One or more Invalid Parameters")
        }
    }

    update() {
        o_dbVisitors.update(
            this._id, this._fName, this._lName,
            this._city, this._postcode, this._street,
            this._houseNumber, this._phoneNumber, this._eMail);
        return this;
    }

    delete() {
        o_dbVisitors.delete(this._id);
    }

    // Type Validators ----------------------------------------------------------
    static isId(id) {
        return !isNaN(id);
    }

    static isFName(fName) {
        const s_name = String(fName)
        // test wether fName is only 1 word
        return /^\b[a-zA-Z_]+\b$/.test(fName);
    }

    static isLName(lName) {
        const s_name = String(lName)
        // test wether lName is only 1 word
        return /^\b[a-zA-Z_]+\b$/.test(lName);
    }

    static isCity(city) {
        const s_name = String(city)
        // test wether city is only 1 word
        return /^\b[a-zA-Z_]+\b$/.test(city);
    }

    static isPostCode(postCode) {
        const s_name = String(postCode)
        return true;
    }

    static isStreet(street) {
        const s_name = String(street)
        return true;
    }

    static isHouseNumber(houseNumber) {
        const s_name = String(houseNumber)
        return true;
    }


    getData() {
        return {
            id: this._id,
            fName: this._fName,
            lName: this._lName,
            city: this._city,
            postcode: this._postcode,
            street: this._street,
            houseNumber: this._houseNumber,
            eMail: this._eMail,
            phoneNumber: this._phoneNumber
        }
    }

    getId() {
        return this._id;
    }
}


// Private Section --------------------------------------------------------------------------------------------------
function f_loadVisitorFromDataRow(visitorData) {
    return new Visitor(visitorData.ID, visitorData.F_NAME, visitorData.L_NAME,
        visitorData.CITY, visitorData.POSTCODE, visitorData.STREET, visitorData.HOUSE_NUMBER, visitorData.PHONE_NUMBER, visitorData.E_MAIL);
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    const o_visitorData = o_dbVisitors.create(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail);
    return f_loadVisitorFromDataRow(o_visitorData);
}

function f_getVisitor(id) {
    const o_visitorData = o_dbVisitors.get(id);
    return f_loadVisitorFromDataRow(o_visitorData);
}

function f_getAllVisitors() {
    const a_visitorData = o_dbVisitors.getAll();
    const a_visitors = [];

    a_visitorData.forEach(
        (o_visitorData)=>{
            a_visitors.push(f_loadVisitorFromDataRow(o_visitorData));
        });        
    return a_visitors;
}

module.exports.create = f_createVisitor;
module.exports.getById = f_getVisitor;
module.exports.getAll = f_getAllVisitors;