const e = require("express");

// Type Validators ----------------------------------------------------------
const o_regex = {
    "POSITIVE_INT": /^\d+$/,
    "NAME": /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'-]+$/,
    "CITY": /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]+$/,
    "HOUSE_NUMBER": /^(?!0)\d[0-9a-zA-Z-/ ]*$/,
    "NOT_EMPTY_STRING": /^(?!\s*$).+/,
    "E_MAIL": /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    "PHONE_NUMBER": /^[+0-9]{8,15}$/
}

function f_test (object, tag) {
    var b_isValid = false;
    if (o_regex[tag] !== undefined){
       b_isValid = o_regex[tag].test(object); 
    }
    else if (tag === "DATE_TIME_STRING"){
        if (typeof object !== "string" || object.length !== 24){
            b_isValid = false;
        }
        else {
            var n_year = object.substring(0, 4);
            var n_month = object.substring(5, 7) -1;
            var n_day = object.substring(8, 10);
            var n_hours = object.substring(11, 13);
            var n_minutes = object.substring(14, 16);
            var n_seconds = object.substring(17, 19); 
            
    
            b_isValid = !(isNaN(n_year) || isNaN(n_month) || isNaN(n_day) || isNaN(n_hours) || isNaN(n_minutes) || isNaN(n_seconds));
        }        
    }
    else {
        throw new Error("Validation-Tag " + String(tag) + " does not exist");
    }
    if(!b_isValid){
        console.log("Invalid Object: ", object, "for tag: ", tag )
    }
    return b_isValid
}

function f_convertToDate (dateTimeString) {
    if (f_test(dateTimeString, "DATE_TIME_STRING") === false){
        throw new TypeError("One or more Invalid Parameters");
    }
    var n_year = dateTimeString.substring(0, 4);
        var n_month = dateTimeString.substring(5, 7) -1;
        var n_day = dateTimeString.substring(8, 10);
        var n_hours = dateTimeString.substring(11, 13);
        var n_minutes = dateTimeString.substring(14, 16);
        var n_seconds = dateTimeString.substring(17, 19);
    return new Date(Date.UTC(n_year, n_month, n_day, n_hours, n_minutes, n_seconds));
}

module.exports.test = f_test;
module.exports.convertToDate = f_convertToDate;


