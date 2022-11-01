const request = require("supertest");
const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient, ObjectId } = require("mongodb");
const { RESERVATIONS_COLLECTION } = require("../constants/mongoDB");

const { 
    validateEmail,
    validateName,
    validateNumberOfPeople,
    validateDate,
    validateNumberOfDaysBooked
} = require("../handlers/validation/reservation");

jest.mock('../handlers/validation/reservation.js', () => ({
    validateEmail: jest.fn(),
    validateName: jest.fn(),
    validateNumberOfPeople: jest.fn(),
    validateDate: jest.fn(),
    validateNumberOfDaysBooked: jest.fn(),
}));

let connection;
let testDatabase;
let db;

beforeAll(async () => {
    testDatabase = await MongoMemoryServer.create();

    const uri = testDatabase.getUri();
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    connection = await MongoClient.connect(uri, options);
    db = await connection.db("Test");
    app.locals.db = db;
});

beforeEach(() => db.dropDatabase());

afterAll(() => {
    connection.close();
    testDatabase.stop()
});

describe("GET reservation", () => {
    it("should fail if reservationId length < MONGODB_OBJECT_ID_LENGTH", () => {
        return request(app)
            .get("/reservation/2")
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: "2",
                    message: "Invalid reservation Id format." 
                });
            });
    });

    it("should fail if reservationId not in database", () => {
        return request(app)
            .get("/reservation/000000000000000000000000")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 404,
                    data: "000000000000000000000000",
                    message: "Reservation not found." 
                });
            });
    });

    it("should pass if reservationId is in database", () => {
        const mockReservation = {
            _id: ObjectId("635ea9027fcc5992e79f0322"),
            email: "a@gmail.com",
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            dates: ["2022-10-31"]
        };
        db.collection(RESERVATIONS_COLLECTION).insertOne(mockReservation);

        return request(app)
            .get("/reservation/635ea9027fcc5992e79f0322")
            .expect(200)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 200,
                    result: {...mockReservation, _id: "635ea9027fcc5992e79f0322"},
                    message: "Reservation number: 635ea9027fcc5992e79f0322, Name: V R, Number of people: 2, Dates: 2022-10-31 to 2022-10-31." 
                });
            });
    });
});

describe("POST reservation", () => {
    it("should fail if no params passed", () => {
        validateEmail.mockImplementation(() => false);
        validateName.mockImplementation(() => false);
        validateNumberOfPeople.mockImplementation(() => false);
        validateDate.mockImplementation(() => false);

        return request(app)
            .post("/reservation")
            .send({})
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: {},
                    message: "Missing or invalid email, first name, last name, number of people, check-in date, and/or check-out date." 
                });
            });
    });

    it("should fail if one param is not valid", () => {
        const mockReservation = {
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            checkInDate: "2022-10-31",
            checkOutDate: "2022-11-01"
        };

        validateEmail.mockImplementation(() => false);
        validateName.mockImplementation(() => true);
        validateNumberOfPeople.mockImplementation(() => true);
        validateDate.mockImplementation(() => true);

        return request(app)
            .post("/reservation")
            .send(mockReservation)
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: mockReservation,
                    message: "Missing or invalid email, first name, last name, number of people, check-in date, and/or check-out date." 
                });
            });
    });

    it("should fail if number of days booked is not good", () => {
        const mockReservation = {
            email: "a@gmail.com",
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            checkInDate: "2022-11-02",
            checkOutDate: "2022-11-01"
        };

        validateEmail.mockImplementation(() => true);
        validateName.mockImplementation(() => true);
        validateNumberOfPeople.mockImplementation(() => true);
        validateDate.mockImplementation(() => true);
        validateNumberOfDaysBooked.mockImplementation(() => false);

        return request(app)
            .post("/reservation")
            .send(mockReservation)
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: mockReservation,
                    message: "Check-in date, and/or check-out date are invalid. Booking needs to be for at least 1 day and at most 3 days." 
                });
            });
    });

    it("should fail if all dates are already in database", () => {
        const mockReservationInDatabase = {
            _id: ObjectId("635ea9027fcc5992e79f0322"),
            email: "a@gmail.com",
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            dates: ["2022-10-31", "2022-11-01", "2022-11-02"]
        };
        db.collection(RESERVATIONS_COLLECTION).insertOne(mockReservationInDatabase);
        
        const mockReservationToAddToDatabase = {
            email: "b@gmail.com",
            firstName: "E",
            lastName: "T",
            numberOfPeople: 3,
            checkInDate: "2022-10-31",
            checkOutDate: "2022-11-02",
        };

        validateEmail.mockImplementation(() => true);
        validateName.mockImplementation(() => true);
        validateNumberOfPeople.mockImplementation(() => true);
        validateDate.mockImplementation(() => true);
        validateNumberOfDaysBooked.mockImplementation(() => true);

        return request(app)
            .post("/reservation")
            .send(mockReservationToAddToDatabase)
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: mockReservationToAddToDatabase,
                    message: "Dates chosen are not available." 
                });
            });
    });

    it("should fail if some dates are already in database", () => {
        const mockReservationInDatabase = {
            _id: ObjectId("635ea9027fcc5992e79f0329"),
            email: "a@gmail.com",
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            dates: ["2022-11-05", "2022-11-06", "2022-11-07"]
        };
        db.collection(RESERVATIONS_COLLECTION).insertOne(mockReservationInDatabase);
        
        const mockReservationToAddToDatabase = {
            email: "b@gmail.com",
            firstName: "E",
            lastName: "T",
            numberOfPeople: 3,
            checkInDate: "2022-11-07",
            checkOutDate: "2022-11-08",
        };

        validateEmail.mockImplementation(() => true);
        validateName.mockImplementation(() => true);
        validateNumberOfPeople.mockImplementation(() => true);
        validateDate.mockImplementation(() => true);
        validateNumberOfDaysBooked.mockImplementation(() => true);

        return request(app)
            .post("/reservation")
            .send(mockReservationToAddToDatabase)
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: mockReservationToAddToDatabase,
                    message: "Dates chosen are not available." 
                });
            });
    });

    it("should pass if some dates are not in database", () => {        
        const mockReservationToAddToDatabase = {
            email: "b@gmail.com",
            firstName: "E",
            lastName: "T",
            numberOfPeople: 3,
            checkInDate: "2022-12-07",
            checkOutDate: "2022-12-08",
        };

        validateEmail.mockImplementation(() => true);
        validateName.mockImplementation(() => true);
        validateNumberOfPeople.mockImplementation(() => true);
        validateDate.mockImplementation(() => true);
        validateNumberOfDaysBooked.mockImplementation(() => true);

        return request(app)
            .post("/reservation")
            .send(mockReservationToAddToDatabase)
            .expect(201)
            .expect("Content-Type", /json/)
    });

});

describe("DELETE reservation", () => {
    it("should fail if reservationId length < MONGODB_OBJECT_ID_LENGTH", () => {
        return request(app)
            .get("/reservation/2")
            .expect(400)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 400,
                    data: "2",
                    message: "Invalid reservation Id format." 
                });
            });
    });

    it("should fail if reservationId not in database", () => {
        return request(app)
            .get("/reservation/000000000000000000000000")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 404,
                    data: "000000000000000000000000",
                    message: "Reservation not found." 
                });
            });
    });

    it("should pass if reservationId is in database", () => {
        const mockReservation = {
            _id: ObjectId("635ea9027fcc5992e79f0322"),
            email: "a@gmail.com",
            firstName: "V",
            lastName: "R",
            numberOfPeople: 2,
            dates: ["2022-10-31"]
        };
        db.collection(RESERVATIONS_COLLECTION).insertOne(mockReservation);
        return request(app)
            .delete("/reservation/635ea9027fcc5992e79f0322")
            .expect(200)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({ 
                    status: 200,
                    message: "Reservation number 635ea9027fcc5992e79f0322 cancelled." 
                });
            });
    });
});

describe("catch all endpoint for unknown routes", () => {
    it("should return 404 for /unknown/route route", () => {
        return request(app)
            .get("/unknown/route")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({
                    status: 404,
                    message: "Resource not found"
                })
            });
    });

    it("should return 404 for /reservation route", () => {
        return request(app)
            .get("/reservation")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({
                    status: 404,
                    message: "Resource not found"
                })
            });
    });

    it("should return 404 for / route", () => {
        return request(app)
            .get("/")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                expect(response.body).toEqual({
                    status: 404,
                    message: "Resource not found"
                })
            });
    });
});