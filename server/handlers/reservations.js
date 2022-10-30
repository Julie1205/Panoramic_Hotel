const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { ObjectId } = require("mongodb");
dayjs.extend(customParseFormat);

const { RESERVATIONS_COLLECTION } = require("../constants/mongoDBConstants");

const { 
    validateEmail,
    validateName,
    validateNumberOfPeople,
    validateDate,
    validateNumberOfDaysBooked
} = require("../validationFunctions/reservationValidations");

const makeReservation = async (req, res) => {
    const { 
        email, 
        firstName, 
        lastName, 
        numberOfPeople, 
        checkInDate, 
        checkOutDate 
    } = req.body;
    
    const db = req.app.locals.db;

    //validating the entries
    const isEmailGood = validateEmail(email);
    const isFirstNameGood = validateName(firstName);
    const isLastNameGood = validateName(lastName);
    const isNumberOfPeopleGood = validateNumberOfPeople(numberOfPeople);
    const isCheckInDateGood = validateDate(checkInDate);
    const isCheckOutDateGood = validateDate(checkOutDate);

    if(isEmailGood && isFirstNameGood && isLastNameGood && isNumberOfPeopleGood && isCheckInDateGood && isCheckOutDateGood) {
        const isNumDatesBookedGood = validateNumberOfDaysBooked(checkInDate, checkOutDate);

        if(isNumDatesBookedGood) {
            const numDaysBooked = dayjs(checkOutDate).diff(checkInDate, "days") + 1;
            const daysToBookArray = [];
            let index = 1;
            
            while(daysToBookArray.length < numDaysBooked) {
                if(daysToBookArray.length === 0) {
                    daysToBookArray.push(dayjs(checkInDate).format('YYYY-MM-DD'));
                }
                else if(daysToBookArray.length === numDaysBooked - 1) {
                    daysToBookArray.push(dayjs(checkOutDate).format('YYYY-MM-DD'));
                }
                else {
                    daysToBookArray.push(dayjs(checkInDate).add(index, "day").format('YYYY-MM-DD'));
                    index++;
                }
            };

            try {
                const result = await db.collection(RESERVATIONS_COLLECTION).findOne( { dates: { $in: daysToBookArray } } );

                if(result) {
                    return res.status(400).json( { status: 400, data: req.body, message: "Dates chosen are not available." } );
                }
                else {
                    const newReservation = {
                        email: email.toLowerCase().trim(),
                        firstName: firstName.trim().toLowerCase(),
                        lastName:lastName.trim().toLowerCase(),
                        numberOfPeople: numberOfPeople,
                        dates: daysToBookArray
                    };

                    const insertResult = await db.collection(RESERVATIONS_COLLECTION).insertOne(newReservation);

                    if(insertResult.insertedId) {
                        let reservationId = insertResult.insertedId;
                        res.status(201).json( { 
                            status: 201,
                            result: reservationId,  
                            message: `Your reservation number is ${ reservationId } and the email used to make the reservation is ${ newReservation.email }. To cancel your reservation or retrieve your reservation details, you will need both your reservation number and the email you used to make the reservation.`
                        } );
                    }
                    else {
                        res.status(500).json( { status: 500,  data: req.body, message: "Unable to add reservation." } );
                    }
                }
            }
            catch (err) {
                console.log(err.stack);
                res.status(500).json( { status: 500, data: req.body, message: err.message } );
            }
            
        }
        else {
            return res.status(400).json( { status: 400, data: req.body, message: "Check-in date, and/or check-out date are invalid. Booking needs to be for at least 1 day and at most 3 days." } );
        }
    }
    else {
        return  res.status(400).json( { status: 400, data: req.body, message: "Missing or invalid email, first name, last name, number of people, check-in date, and/or check-out date." } );
    }
};

const getReservation = async (req, res) => {
    const { reservationId, email } = req.params;
    const db = req.app.locals.db;
    
    if(reservationId.length === 24) {
        try {
            const result = await db.collection(RESERVATIONS_COLLECTION).findOne( { _id: ObjectId(reservationId), email } );
            if(result) {
                return res.status(200).json({ 
                    status: 200, 
                    result: result, 
                    message: `Reservation number: ${ result._id }, Name: ${result.firstName} ${ result.lastName }, Number of people: ${ result.numberOfPeople }, Dates: ${ result.dates[0] } to ${ result.dates[result.dates.length - 1] }.` 
                });
            }
            else {
                return res.status(404).json( { status: 404, data: req.params, message: "Reservation not found." } )
            }
        }
        catch (err) {
            console.log(err.stack);
            res.status(500).json( { status: 500, data: req.body, message: err.message } );
        }
    }
    else {
        return res.status(400).json( { status: 400, data: req.params, message: "Invalid reservation Id." } );
    }
};

const deleteReservation = async (req, res) => {
    const { reservationId, email } = req.params;
    const db = req.app.locals.db;

    if(reservationId.length === 24) {
        try {
            const result = await db.collection(RESERVATIONS_COLLECTION).deleteOne( { _id: ObjectId(reservationId), email } );
            if(result.deletedCount === 1) {
                return res.status(200).json({ 
                    status: 200, 
                    message: `Reservation number ${ reservationId } cancelled.` 
                });
            }
            else {
                return res.status(404).json( { status: 404, data: req.params, message: "Reservation could not be found and or deleted." } )
            }
        }
        catch (err) {
            console.log(err.stack);
            res.status(500).json( { status: 500, data: req.body, message: err.message } );
        }
    }
    else {
        return res.status(400).json( { status: 400, data: req.params, message: "Invalid reservation Id." } );
    }
};

module.exports = { makeReservation, getReservation, deleteReservation };