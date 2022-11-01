const app = require("./app");

const { 
    connectToMongoDb,  
    closeMongoDb 
} = require("./data/mongoDB/connection");

const port = 8000;

//connect to mongoDB and store connection in app.locals to be available throughout app
connectToMongoDb()
    .then(db => {
            app.locals.db = db;
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });
    });

//close connection to MongoDb 
process.on("SIGINT", closeMongoDb);
process.on("SIGTERM", closeMongoDb);