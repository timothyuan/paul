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
app.get('/candidates', function(req, res) {
  pool.query("SELECT * FROM candidates;", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

// Get a single user
app.get('/candidates/:id', function(req, res) {
  pool.query("SELECT * FROM candidates where id='"+req.params.id+"';", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

// Create a new user
app.post('/candidates', function(req, res) {
  var name = req.body.name;
  var party = req.body.party;
  pool.query("INSERT INTO candidates (name,party) VALUES ('"+name+"','"+party+"');", (err, response) => {
    if (err) {
      res.send(err);
    }
    res.send(response.rows);
  });
});

//Delete a profile with an associated id
app.delete('/candidates/:id', function (req,res) {
  pool.query("DELETE FROM candidates WHERE id='" + req.params.id + "';",(err,response)=>{

    console.log(response.rowCount);
    if (err) {
      res.send(err);
      console.log('error');
    } else if (response.rowCount === 0){
      res.send('entry does not exist');
      console.log('entry does not exist');
    } else {
      res.send('deleted');
      console.log('deleted');
    }
  });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
