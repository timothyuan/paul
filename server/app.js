var cors = require('cors');
var express = require('express');
var app = express();
var candidates = require('./routes/candidates.js')
var precincts = require('./routes/precincts.js')
var votes = require('./routes/votes.js')

// Allow cross origin resource sharing
app.use(cors());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Routes
app.use('/candidates', candidates);
app.use('/precincts', precincts);
app.use('/votes',votes);

var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
