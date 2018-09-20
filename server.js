const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();
var cors = require('cors');
module.exports = app; // for testing

// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '50mb'}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Configuring the database
const mongoose = require('mongoose');

require('./app/routes/collectiontv.routes.js')(app);

mongoose.Promise = global.Promise;

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes."});
});

// listen for requhttps://swagger.io/docs/specification/data-models/data-types/ests
app.listen(process.env.PORT || 2900, () => {
    console.log("Server is listening on port 2900");
});