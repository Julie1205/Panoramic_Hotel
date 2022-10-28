const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 8000;

app.use(morgan("tiny"));
app.use(express.json());

//testing connection to server
app.get("/testing", (req, res) => res.status(200).json( { status: 200, message: "hello" } ));

app.listen(port, () => {
    console.log(`Server listneing on port ${port}`);
});