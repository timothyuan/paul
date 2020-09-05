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
  if('precinct_id' in params){
    Object.defineProperty(params, 'precincts.id', Object.getOwnPropertyDescriptor(params, 'precinct_id'));
    delete params['precinct_id'];
  }
  var query = "SELECT candidates.name, votes.precinct_id, votes.count, precincts.city, precincts.county, race.african_american, race.asian, race.caucasian, race.hispanic, race.native_american, race.uncoded, race.unknown, age.a, age.b, age.c, age.d, age.e, age.unknown, sex.male, sex.female, sex.unknown FROM votes INNER JOIN candidates ON (votes.candidate_id = candidates.id) INNER JOIN precincts ON (votes.precinct_id=precincts.id) INNER JOIN race ON (precincts.id=race.precinct_id) INNER JOIN age ON (precincts.id=age.precinct_id) INNER JOIN sex ON (precincts.id=sex.precinct_id)";
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
