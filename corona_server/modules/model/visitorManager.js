class Visitor {

    constructor(id, fName, lName, city, postcode, street, houseNumber) {
        if (Visitor.isId(id) && Visitor.isFName(fName) && Visitor.isLName(lName) &&
            Visitor.isCity(city) && Visitor.isPostCode(postcode) && Visitor.isStreet(street) && Visitor.isHouseNumber(houseNumber)){
            this._id = id;
            this._fName = fName;
            this._lName = lName;
            this._city = city;
            this._postcode = postcode;
            this._street = street;
            this._houseNumber = houseNumber;
        }
        else {
            throw new TypeError("One or more Invalid Parameters")
        }
    }

    update() {
        if (this._id == undefined) {
            throw new Error("Critical Programming Error - No id found");
        }
        console.log("update to db");
        return this;
    }

    delete() {
        if (this.id == undefined) {
            throw new Error("Critical Programming Error - No id found");
        }
        console.log("Delete row in db");
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
}

function f_createVisitor(fName, lName, city, postcode, street, houseNumber) {
    // Save to db
    return new Visitor(55, fName, lName, city, postcode, street, houseNumber);
}

function f_getVisitor(id) {
    // Get from db
    return new Visitor();
}

module.exports.create = f_createVisitor;
module.exports.get = f_getVisitor;