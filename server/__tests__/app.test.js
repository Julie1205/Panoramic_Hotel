const request = require("supertest");
const app = require("../app");

describe("catch all endpoint for unknown routes", () => {
    it("should return 404 for /unknown/route route", () => {
        return request(app)
            .get("/unknown/route")
            .expect(404)
            .expect("Content-Type", /json/)
            .then(response => {
                console.log(response.body);
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
                console.log(response.body);
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
                console.log(response.body);
                expect(response.body).toEqual({
                    status: 404,
                    message: "Resource not found"
                })
            });
    });
})