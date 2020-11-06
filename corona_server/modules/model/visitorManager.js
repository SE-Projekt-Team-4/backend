class Visitor {

    constructor(id, fName, lName, city, postcode, street, houseNumber) {
        this._id = id;
        this._fName = fName;
        this._lName = lName;
        this._city = city;
        this._postcode = postcode;
        this._street = street;
        this._houseNumber = houseNumber;
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