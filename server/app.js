const express = require("express");
const morgan = require("morgan");

const { 
    makeReservation, 
    getReservation,
    deleteReservation
} = require("./handlers/reservations");

const app = express();

app.use(morgan("tiny"));
app.use(express.json());

//reservation endpoints
app.get("/reservation/:reservationId", getReservation);
app.post("/reservation", makeReservation);
app.delete("/reservation/:reservationId", deleteReservation);

//catch all endpoint
app.get("*", (req, res) => {
    res.status(404).json({
        status: 404,
        message: "Resource not found"
    });
});

module.exports = app;