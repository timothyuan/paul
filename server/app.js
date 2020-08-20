var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
  database: 'pauldb'
});

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Get list of all users
app.get('/users', function(req, res) {
  pool.query("SELECT * FROM users;", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

// Get a single user
app.get('/users/:id', function(req, res) {
  pool.query("SELECT * FROM users where id='"+req.params.id+"';", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

// Create a new user
app.post('/users', function(req, res) {
  var name = req.body.name;
  pool.query("INSERT INTO users (name) VALUES ('"+name+"');", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
