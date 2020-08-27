var express = require('express');
var router = express.Router();

const { Pool } = require('pg');
const pool = new Pool({
  database: 'pauldb'
});

// getQuery():
//  returns a get query
//Parameters:
//  table: what table to access
//  params: object with name and value of each entry
function getQuery(table, params) {
  var query = "SELECT * FROM " + table;

  var first = true;
  for (let key in params) {
      if (first) {
        query += " WHERE " + key + "=" + params[key];
        first = false;
      }else{
      query += " AND " + key + "=" + params[key];
      }
  }
  query += ";";
  return query;
}


//Gets list of all votes for the candidates, or certain candidates/precincts.
router.get('/', function(req,res) {
  pool.query(getQuery("votes",req.query), (err, response) => {
    if (err) {
      res.send(err);
      console.log('error');
    } else if(response.rowCount === 0){
      res.send('votes do not exist for that candidate/precinct');
      console.log('votes do not exist for that candidate/precinct');
    } else {
      res.send(response.rows);
      console.log(response.rows);
    }
  });
});



module.exports = router;
