const express = require("express");
const app = express();

// use the express-static middleware
app.use(express.static("public"))

// start the server listening for requests
app.listen(process.env.PORT || 8080, 
	() => console.log("Server is running..."));