const { MongoClient } = require("mongodb");
const { DATABASE_NAME } = require("../../constants/mongoDB");
require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const client = new MongoClient(MONGO_URI, options);

const connectToMongoDb = async () => {
    try {
        await client.connect();
        const db = client.db(DATABASE_NAME);
        console.log("MongoDB connected.");
        return db;
    }
    catch (err) {
        console.log(err.stack);
        process.exit(1);
    }
};

const closeMongoDb = () => {
    client.close();
    console.info("MongoDB connection closed");
    process.exit();
};

module.exports = { connectToMongoDb,  closeMongoDb };

