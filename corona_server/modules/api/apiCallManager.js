
class ApiCallManager {

    static numOfCalls = 0;

    constructor(req, res) {
        this._res = res,
        this._callData = {
            id: ApiCallManager.numOfCalls,
            method: req.method,
            path: req.path
        }
        ApiCallManager.numOfCalls = ApiCallManager.numOfCalls + 1;
    }

    setError(errorCode) {
        const o_customErrors = {
            "SYSERR" : {
                status : 500,
                message : "500 - Internal Server Error"
            },
            "JSONPARSE" : {
                status : 400,
                message : "There was a JSON Parsing Error"
            },
            "NOROUTE" : {
                status : 404,
                message : "No such route"
            },
            "NOMATCH" : {
                status : 404,
                message : "No match with that Id exists"
            },
            "BOOKNOMATCH" : {
                status : 422,
                message : "Could not create Booking, no Match with that id exists"
            },
            "BOOKNOSPACE" : {
                status : 422,
                message : "Could not create Booking, the match is already booked out"
            },
            "PARAMNOTVALID" : {
                status : 403,
                message : "Bad Request - One or more parameters were invalid"
            }
        }
        delete this._callData.data;
        delete this._callData.error;
        this._callData.error = o_customErrors[errorCode];
        if(this._callData.error === undefined) {
            throw new Error("Errorhandling failed - Unknown ErrorCode: " + errorCode);
        }
        else {
            this._callData.error.errorCode = errorCode
        }
        return this;
    }

    setData( data ) {
        delete this._callData.data;
        delete this._callData.error;
        this._callData.data = data;
        return this;
    }

    getErrorStatus() {
        if (this._callData.error === undefined){
            return 200;
        }
        else {
            return this._callData.error.status;
        }
    }

    getResponseObject() {
        return this._callData;
    }

    sendResponse(res) {
        var o_res;
        if (res === undefined){
            o_res = this._res;           
        }
        else{
            o_res = res;
        }
        o_res.status(this.getErrorStatus()).json(this.getResponseObject());
    }


}

module.exports = ApiCallManager;
