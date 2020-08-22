var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  database: 'pauldb'
});

// Get list of all candidates
router.get('/', function(req, res) {
  pool.query("SELECT * FROM candidates;", (err, response) => {
    if (err) {
      res.send(err);
      console.log('error');
    }
    res.send(response.rows);
    console.log(response.rows);
  });
});

// Create a new candidate
router.post('/', function(req, res) {
  var name = req.body.name;
  var party = req.body.party;
  pool.query("INSERT INTO candidates (name,party) VALUES ('"+name+"','"+party+"');", (err, response) => {
    if (err) {
      res.send(err);
      console.log('error');
    }
    res.send('created: Candidate('+name+','+party+')');
    console.log('created: Candidate('+name+','+party+')');
  });
});

// Get a single candidate
router.get('/:id', function(req, res) {
  pool.query("SELECT * FROM candidates where id='"+req.params.id+"';", (err, response) => {
    if (err) {
      res.send(err);
      console.log('error');
    } else if(response.rowCount === 0){
      res.send('candidate does not exist');
      console.log('candidate does not exist');
    } else {
      res.send(response.rows);
      console.log(response.rows);
    }
  });
});

//Delete a candidate with an associated id
router.delete('/:id', function (req,res) {
  pool.query("DELETE FROM candidates WHERE id='" + req.params.id + "';",(err,response)=>{
    if (err) {
      res.send(err);
      console.log('error');
    } else if (response.rowCount === 0){
      res.send('candidate does not exist');
      console.log('candidate does not exist');
    } else {
      res.send('deleted');
      console.log('deleted');
    }
  });
});

module.exports = router;
