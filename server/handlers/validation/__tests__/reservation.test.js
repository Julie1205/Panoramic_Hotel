const { 
    MINIMUM_NUMBER_DAYS,
    MAX_NUMBER_DAYS,
    MINIMUM_NUMBER_PEOPLE,
    MAX_NUMBER_PEOPLE
} = require("../../../constants/reservation");

const { 
    validateEmail,
    validateName,
    validateNumberOfPeople,
    validateDate,
    validateNumberOfDaysBooked
} = require("../reservation");

describe("validateEmail", () => {
    it("should fail with no email", () => {
        expect(validateEmail(undefined)).toBe(false);
    });

    it("should fail if email is not a string", () => {
        expect(validateEmail(2)).toBe(false);
    });

    it("should fail if email does not match expected Regex", () => {
        expect(validateEmail("aaa")).toBe(false);
        expect(validateEmail("a@")).toBe(false);
        expect(validateEmail("@a")).toBe(false);
        expect(validateEmail("john@g")).toBe(false);
        expect(validateEmail("john.ca")).toBe(false);
        expect(validateEmail("apple@.com")).toBe(false);
        expect(validateEmail("@gmail.com")).toBe(false);
        expect(validateEmail("john@gmail")).toBe(false);
        expect(validateEmail("j@*.com")).toBe(false);
        expect(validateEmail("j%@*g.com")).toBe(false);
    });

    it("should pass if email match expected Regex", () => {
        expect(validateEmail("apple@gmail.com")).toBe(true);
    });
});

describe("validateName", () => {
    it("should fail with no name", () => {
        expect(validateName(undefined)).toBe(false);
    });

    it("should fail if name is not a string", () => {
        expect(validateName(23)).toBe(false);
    });

    it("should fail if name is just a space", () => {
        expect(validateName(" ")).toBe(false);
    });

    it("should pass if name is a string", () => {
        expect(validateName("Alice")).toBe(true);
    });
});

describe("validateNumberOfPeople", () => {
    it("should fail if number of people not provided", () => {
        expect(validateNumberOfPeople(undefined)).toBe(false);
    });
    
    it("should fail if number is not a number", () => {
        expect(validateNumberOfPeople("2")).toBe(false);
    });

    it("should fail if number < MINIMUM_NUMBER_PEOPLE", () => {
        expect(validateNumberOfPeople(0)).toBe(false);
    });

    it("should fail if number > MAX_NUMBER_PEOPLE", () => {
        expect(validateNumberOfPeople(4)).toBe(false);
    });

    it("should pass if MINIMUM_NUMBER_PEOPLE <= number <= MAX_NUMBER_PEOPLE", () => {
        expect(validateNumberOfPeople(1)).toBe(true);
        expect(validateNumberOfPeople(3)).toBe(true);
    });
});

describe("validateDate", () => {
    it("should fail with no date", () => {
        expect(validateDate(undefined)).toBe(false);
    });

    it("should fail if date is not a string", () => {
        expect(validateDate(2022-10-31)).toBe(false);
    });

    it("should fail if date does not match expected Regex", () => {
        expect(validateDate("aaa")).toBe(false);
        expect(validateDate("May 2nd 2022")).toBe(false);
        expect(validateDate("3 May 2022")).toBe(false);
        expect(validateDate("03-04-2022")).toBe(false);
        expect(validateDate("03/04/2022")).toBe(false);
        expect(validateDate("2022/04/12")).toBe(false);
    });

    it("should fail if date is not a valid date", () => {
        expect(validateDate("2022-45-01")).toBe(false);
        expect(validateDate("2022-02-31")).toBe(false);
    });

    it("should fail if date is in the pass", () => {
        expect(validateDate("2022-01-01")).toBe(false);
        expect(validateDate("2001-12-01")).toBe(false);
    });

    it("should pass if date match expected Regex and is a valid date in the future", () => {
        expect(validateDate("2024-01-01")).toBe(true);
    });
});

describe("validateNumberOfDaysBooked", () => {

    it("should fail if number of days booked < MINIMUM_NUMBER_DAYS", () => {
        expect(validateNumberOfDaysBooked("2022-11-03", "2022-11-02")).toBe(false);
    });

    it("should fail if number of days booked > MAX_NUMBER_DAYS", () => {
        expect(validateNumberOfDaysBooked("2022-11-03", "2022-11-07")).toBe(false);
    });

    it("should pass if MINIMUM_NUMBER_DAYS <= number of days booked <= MAX_NUMBER_DAYS", () => {
        expect(validateNumberOfDaysBooked("2022-11-03", "2022-11-03")).toBe(true);
        expect(validateNumberOfDaysBooked("2022-11-03", "2022-11-05")).toBe(true);
    });
});