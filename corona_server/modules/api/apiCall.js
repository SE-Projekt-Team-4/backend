/**
 * @module apiCall
 */

//== Types ================================================================
/**
* @typedef {Object} callData
* @property {number} id - Id of the call
* @property {string} methode - Http methode used
* @property {string} path - Called path
*/
//=========================================================================

/** Private Variable used to assign ID's to calls */
var n_calls = 0;

/** Private Variable that contains the data for the custom errors to be returned by the api calls*/
const o_errors = {
    "SYSERR": {
        status: 500,
        message: "500 - Internal Server Error"
    },
    "NOAUTH": {
        status: 401,
        message: "401 - Not Authorized"
    },
    "JSONPARSE": {
        status: 400,
        message: "There was a JSON Parsing Error"
    },
    "NOROUTE": {
        status: 404,
        message: "No such route"
    },
    "NOMATCH": {
        status: 404,
        message: "No match found"
    },
    "SPACESLTBOOKINGS": {
        status: 403,
        message: "Could not update match, new max Spaces are lower than already booked spaces, consider cancelling the match instead"
    },
    "REDEEMNOMATCH": {
        status: 404,
        message: "No booking found for verification Code"
    },
    "BOOKNOMATCH": {
        status: 422,
        message: "Could not create Booking, no Match with that id exists"
    },
    "BOOKNOSPACE": {
        status: 403,
        message: "Could not create Booking, the match is already booked out"
    },
    "PARAMNOTVALID": {
        status: 400,
        message: "Bad Request - One or more parameters were invalid"
    },
    "ALREADYREDEEMED": {
        status: 403,
        message: "This booking has already been redeemed"
    }
}

/** Class representing an api call. */
class ApiCall {
    /**
     * Create an api call using express structures.
     * @param {Express.Request} req - An express request.
     * @param {Express.Response} res - An express response.
     */
    constructor(req, res) {
        this._req = req,
            this._res = res,
            this._callData = {
                id: n_calls,
                method: req.method,
                path: req.path
            }
        n_calls += 1;
    }

    /**
     * Populate the api call data using one of the predefined errors.
     * @param {string} errorCode - One of the predefined errorCodes, that is used to fetch additional data for the error.
     * @param {any} additionalData - Additional data will be added to the "additionaData" tag of the error.
     * @return {ApiCall} - Returns itself to allow for function chaining.
     */
    setError(errorCode, additionalData) {
        delete this._callData.data;
        delete this._callData.error;
        this._callData.error = o_errors[errorCode];
        if (this._callData.error === undefined) {
            throw new Error("Errorhandling failed - Unknown ErrorCode: " + errorCode);
        }
        else {
            this._callData.error.errorCode = errorCode
            if (additionalData !== null && additionalData !== undefined) {
                this._callData.error.additionalData = additionalData
            }
        }
        return this;
    }

    /**
     * Populate the api call data using data.
     * @param {any} data - Data to be sent.
     * @return {ApiCall} - Returns itself to allow for function chaining.
     */
    setData(data) {
        delete this._callData.data;
        delete this._callData.error;
        this._callData.data = data;
        return this;
    }

    /**
     * Send a response using this api calls response and data.
     */
    sendResponse() {
        this._res.status(this.getErrorStatus()).json(this.getCallData());
    }

    /**
     * Returns the http status based on current state of the call data. If no error is set it returns 200.
     * @return {number} - Returns http status.
     */
    getErrorStatus() {
        if (this._callData.error === undefined) {
            return 200;
        }
        else {
            return this._callData.error.status;
        }
    }

    /**
     * Returns data about the api call.
     * @return {callData}
     */
    getCallData() {
        return this._callData;
    }

    /**
     * Returns an object containing all request parameters.
     * @return {any}
     */
    getRequestParams() {
        return this._req.params;
    }

    /**
     * Returns an object containing all request parameters.
     * @return {any}
     */
    getRequestBody() {
        return this._req.body;
    }
}

module.exports = ApiCall;
