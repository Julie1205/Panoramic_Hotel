const express = require("express");
const morgan = require("morgan");

const { 
    connectToMongoDb,  
    closeMongoDb 
} = require("./mongoDBConnections/mongoDBConnectionFunctions");

const { makeReservation, getReservation } = require("./handlers/reservations");

const app = express();
const port = 8000;

app.use(morgan("tiny"));
app.use(express.json());

//reservation endpoints
app.get("/reservation/:reservationId/:email", getReservation);
app.post("/reservation", makeReservation);

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