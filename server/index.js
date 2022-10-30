const express = require("express");
const morgan = require("morgan");

const { 
    connectToMongoDb,  
    closeMongoDb 
} = require("./data/mongoDB/connection");

const { 
    makeReservation, 
    getReservation,
    deleteReservation
} = require("./handlers/reservations");

const app = express();
const port = 8000;

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


//connect to mongoDB and store connection inapp.locals to be available throughout app
connectToMongoDb()
.then(db => {
        app.locals.db = db;
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
});

//close connection to MongoDb 
process.on('SIGINT', closeMongoDb);
process.on('SIGTERM', closeMongoDb);