const o_dbVisitors = require("../../database/DBConnector_Final").visitorQueries;
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

    async loadInfo() {
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
        return o_typeHelper.test(this._id, "POSITIVE_INT")
            && o_typeHelper.test(this._fName, "NAME")
            && o_typeHelper.test(this._lName, "NAME")
            && o_typeHelper.test(this._city, "CITY")
            && o_typeHelper.test(this._postcode, "NOT_EMPTY_STRING")
            && o_typeHelper.test(this._street, "NOT_EMPTY_STRING")
            && o_typeHelper.test(this._houseNumber, "HOUSE_NUMBER")
            && o_typeHelper.test(this._phoneNumber, "PHONE_NUMBER")
            && o_typeHelper.test(this._eMail, "E_MAIL");
    }

    update() {
        return f_updateDataRowFromVisitor(this);
    }

    delete() {
        return o_dbVisitors.delete(this._id);
    }

}


// Private Section --------------------------------------------------------------------------------------------------
function f_convertDataRowToVisitor(visitorData) {

    const o_visitor = new Visitor(visitorData.ID, visitorData.F_NAME, visitorData.L_Name,
        visitorData.CITY, visitorData.POSTCODE, visitorData.STREET, visitorData.HOUSE_NUMBER, visitorData.PHONE_NUMBER, visitorData.E_MAIL);
    if (o_visitor.isValid()) {
        return o_visitor;
    }
    else {
        throw new TypeError("Invalid oject or attributes");
    }
}

async function f_updateDataRowFromVisitor(visitor) {
    if (!this.isValid()) {
        throw new TypeError("Invalid oject or attributes");
    }
    const o_visitorData = await o_dbVisitors.update(
        this._id, this._fName, this._lName,
        this._city, this._postcode, this._street,
        this._houseNumber, this._phoneNumber, this._eMail);

    visitor._id = o_visitorData.ID;
    visitor._fName = o_visitorData.F_NAME;
    visitor._lName = o_visitorData.L_Name;
    visitor._city = o_visitorData.CITY;
    visitor._postcode = o_visitorData.POSTCODE;
    visitor._street = o_visitorData.STREET;
    visitor._houseNumber = o_visitorData.HOUSE_NUMBER;
    visitor._phoneNumber = o_visitorData.PHONE_NUMBER;
    visitor._eMail = o_visitorData.E_MAIL;
    return visitor;
}
//-------------------------------------------------------------------------------------------------------------------

// Exports ----------------------------------------------------------------------------------------------------------
async function f_createVisitor(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    if (!(o_typeHelper.test(fName, "NAME")
        && o_typeHelper.test(lName, "NAME")
        && o_typeHelper.test(city, "CITY")
        && o_typeHelper.test(postcode, "NOT_EMPTY_STRING")
        && o_typeHelper.test(street, "NOT_EMPTY_STRING")
        && o_typeHelper.test(houseNumber, "HOUSE_NUMBER")
        && o_typeHelper.test(phoneNumber, "PHONE_NUMBER")
        && o_typeHelper.test(eMail, "E_MAIL"))) {
        throw new Error("INVALID");
    }
    return f_convertDataRowToVisitor(await o_dbVisitors.create(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail));
}

function f_checkConstructorData(fName, lName, city, postcode, street, houseNumber, phoneNumber, eMail) {
    return (o_typeHelper.test(fName, "NAME")
        && o_typeHelper.test(lName, "NAME")
        && o_typeHelper.test(city, "CITY")
        && o_typeHelper.test(postcode, "NOT_EMPTY_STRING")
        && o_typeHelper.test(street, "NOT_EMPTY_STRING")
        && o_typeHelper.test(houseNumber, "HOUSE_NUMBER")
        && o_typeHelper.test(phoneNumber, "PHONE_NUMBER")
        && o_typeHelper.test(eMail, "E_MAIL"))
}

async function f_getVisitor(id) {
    const o_visitorData = await o_dbVisitors.get(id);
    if (o_visitorData === undefined) {
        return null;
    }
    return f_convertDataRowToVisitor(o_visitorData);
}


module.exports.create = f_createVisitor;
module.exports.getById = f_getVisitor;
module.exports.checkData = f_checkConstructorData;