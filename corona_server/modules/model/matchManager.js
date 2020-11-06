

var matches;





class Match {

    constructor(id, opponent, dateTime, maxSpaces, isCancelled) {
        this._id = id;
        this._opponent = opponent;
        this._dateTime = dateTime;
        this._maxSpaces = maxSpaces;
        this._isCancelled = (isCancelled !== true);
    }

    getId() {
        return this._id;
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

    getData() {
        return {
            id : this._id,
            opponent : this._opponent,
            dateTime : this._dateTime,
            maxSpaces : this._maxSpaces,
            isCancelled : this._isCancelled
        }
    }
}

function f_createMatchDay(opponent, dateTime, maxSpaces, isCancelled) {
// Save to db
return new Match();
}
    
function f_getMatchDay(id) {
// Get from db
return new Promise((resolve, reject) => {
    try {
        if(id == 55){
            throw new Error("DB Error");
        }
        if(id < matches.length){
            resolve(matches[id]);
        }
        else{
            resolve();
        }
    }
    catch (e) {
        reject(e);
    }
});
}

function f_getAllMatches() {
// Get from db
return matches;
}

matches = [
    new Match(0, "Dusseldorf", "2007-12-24T18:21Z", 400, false),
    new Match(1, "Mannheim", "2007-12-22T18:21Z", 200, false),
    new Match(2, "Frauheim", "2007-12-21T18:21Z", 300, false),
    new Match(3, "Burg", "2007-12-25T18:21Z", 330, true),
    new Match(4, "Hinterdorf", "2007-12-28T18:21Z", 222, false),
    new Match(5, "Vorderdorf", "2007-12-12T18:21Z", 666, false),
    new Match(6, "Neckarstadt", "2007-12-13T18:21Z", 300, false)
];




module.exports.create = f_createMatchDay;
module.exports.getSingle = f_getMatchDay;
module.exports.getAll = f_getAllMatches;