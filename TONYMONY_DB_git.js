var mysql = require('mysql');
var con = mysql.createConnection({
  host     : server_ip,
  user     : username,
  password : password,
});

exports.show_tables = function() {
  con.query('show tables', function(error, results){
  if(error){
  }
  console.log(results);
  });
  con.end(function(err){});
}

exports.select_from_cosmetics = function(res, callback) {
  //connect_db();
  con.query('SELECT * from cosmetics',
    function(err, rows) {
      callback(err, rows);
  });
}

exports.select_from_survey_tonymony = function(callback) {
  //connect_db();
  con.query('SELECT * from survey_tonymony',
    function(err, rows) {
      callback(err, rows);
  });
}

exports.select_from_borncolor = function(callback) {
  //connect_db();
  con.query('SELECT * from borncolor',
    function(err, rows) {
      callback(err, rows);
  });
}

exports.select_from_personalcolor = function(callback) {
  //connect_db();
  con.query('SELECT * from personalcolor',
    function(err, rows) {
      callback(err, rows);
  });
}

exports.select_count_from_cosmetic = function(callback) {
  //connect_db();
  con.query('SELECT count(*) from cosmetic',
    function(err, result) {
      callback(err, result);
    });
}

exports.connect_db = function() {
  con.connect(function(err){
    if(err){
      console.log('Error connecting to Db');

      return;
    }
    console.log('Connection established');
  //con.query('create database if iexists COMPANYX');
  });
  con.query('use tonymonydb');
}


//con.query('drop database if exists tonymonydb');
//con.query('create database tonymonydb');
