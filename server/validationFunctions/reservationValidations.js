const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { 
    MINIMUM_NUMBER_DAYS,
    MAX_NUMBER_DAYS,
    MINIMUM_NUMBER_PEOPLE,
    MAX_NUMBER_PEOPLE
} = require("../constants/reservationConstants");

const validateEmail = (email) => {
    const emailRegEx = /\w+\@\w+\.\w+/;
    let isEmailGood = false;

    if(email){
        if(typeof(email) === "string") {
            if(emailRegEx.test(email)) {
                isEmailGood = true;
            }
        }
    }
    return isEmailGood;
};

const validateName = (firstOrLastName) => {
    let isNameGood = false;

    if(firstOrLastName) {
        if(typeof(firstOrLastName) === "string") {
            if(firstOrLastName !== " ") {
                isNameGood = true;
            }
        }
    }
    return isNameGood;
};

const validateNumberOfPeople = (number) => {
    let isNumberGood = false;

    if(number) {
        if(typeof(number) === "number") {
            if(number >= MINIMUM_NUMBER_PEOPLE && number <= MAX_NUMBER_PEOPLE) {
                isNumberGood = true;
            } 
        }
    }
    return isNumberGood;
};

const validateDate = (date) => {
    const dateRegEx = /\d{4}-\d{2}-\d{2}/;
    let isDateGood = false;
    const todaysDate = dayjs();

    if(date) {
        if(typeof(date) === "string") {
            if(dateRegEx.test(date)) {
                if(dayjs(date, 'YYYY-MM-DD', true).isValid()) {
                    if(dayjs(date).diff(todaysDate, "days") >= 0) {
                        isDateGood = true;
                    }
                }

            }
        }
    }
    return isDateGood;
};

const validateNumberOfDaysBooked = (checkInDate, checkOutDate) => {
    const isAtLeastMinNumDay = dayjs(checkOutDate).diff(checkInDate, "days") >= MINIMUM_NUMBER_DAYS;
    const isAtMostMaxNumDays = dayjs(checkOutDate).diff(checkInDate, "days") < MAX_NUMBER_DAYS;
    const isNumberOfDaysBookedGood = isAtLeastMinNumDay && isAtMostMaxNumDays;
    return isNumberOfDaysBookedGood;
};

module.exports = {
    validateEmail,
    validateName,
    validateNumberOfPeople,
    validateDate,
    validateNumberOfDaysBooked
};