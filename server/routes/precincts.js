var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  database: 'pauldb'
});

// Get list of all precincts
router.get('/', function(req, res) {
  pool.query("SELECT * FROM precincts;", (err, response) => {
    if (err) {
      res.send(err);
      console.log('error');
    }
    res.send(response.rows);
    console.log(response.rows);
  });
});

module.exports = router;
