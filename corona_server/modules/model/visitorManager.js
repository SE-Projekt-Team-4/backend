const o_dbVisitors = require("./dbConectorDummy").visitorQueries;
const o_typeHelper = require("../typeHelper");



class Visitor {

    constructor(id, fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
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

    update() {
        if (this.isValid()) {
            o_dbVisitors.update(
                this._id, this._fName, this._lName,
                this._city, this._postcode, this._street,
                this._houseNumber, this._phoneNumber, this._eMail);
            return this;
        }
        else {
            throw new TypeError("One or more Invalid Attributes");
        }

    }

    delete() {
        o_dbVisitors.delete(this._id);
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

    isValid() {
        return o_typeHelper.test("POSITIVE_INT", this._id)
            && o_typeHelper.test("NAME", this._fName)
            && o_typeHelper.test("NAME", this._lName)
            && o_typeHelper.test("CITY", this._city)
            && o_typeHelper.test("NOT_EMPTY_STRING", this._postcode)
            && o_typeHelper.test("NOT_EMPTY_STRING", this._street)
            && o_typeHelper.test("HOUSE_NUMBER", this._houseNumber)
            && o_typeHelper.test("PHONE_NUMBER", this._phoneNumber)
            && o_typeHelper.test("E_MAIL", this._eMail);
    }
}


// Private Section --------------------------------------------------------------------------------------------------
function f_loadVisitorFromDataRow(visitorData) {

    const o_visitor = new Visitor(visitorData.ID, visitorData.F_NAME, visitorData.L_NAME,
        visitorData.CITY, visitorData.POSTCODE, visitorData.STREET, visitorData.HOUSE_NUMBER, visitorData.PHONE_NUMBER, visitorData.E_MAIL);

    if (o_visitor.isValid()) {
        return o_visitor;
    }
    else {
        throw new TypeError("One or more Invalid Attributes");
    }
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {

    if (o_typeHelper.test("NAME", fName)
        && o_typeHelper.test("NAME", lName)
        && o_typeHelper.test("CITY", city)
        && o_typeHelper.test("NOT_EMPTY_STRING", postcode)
        && o_typeHelper.test("NOT_EMPTY_STRING", street)
        && o_typeHelper.test("HOUSE_NUMBER", houseNumber)
        && o_typeHelper.test("PHONE_NUMBER", phoneNumber)
        && o_typeHelper.test("E_MAIL", eMail)) {

        const o_visitorData = o_dbVisitors.create(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail);
        return f_loadVisitorFromDataRow(o_visitorData);
    }
    else {
        throw new TypeError("One or more Invalid Parameters");
    }
}

function f_getVisitor(id) {
    const o_visitorData = o_dbVisitors.get(id);
    return f_loadVisitorFromDataRow(o_visitorData);
}

function f_getAllVisitors() {
    const a_visitorData = o_dbVisitors.getAll();
    const a_visitors = [];

    a_visitorData.forEach(
        (o_visitorData) => {
            a_visitors.push(f_loadVisitorFromDataRow(o_visitorData));
        });
    return a_visitors;
}

module.exports.create = f_createVisitor;
module.exports.getById = f_getVisitor;
module.exports.getAll = f_getAllVisitors;