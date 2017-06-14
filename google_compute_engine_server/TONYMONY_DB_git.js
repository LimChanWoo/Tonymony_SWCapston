var mysql = require('mysql');
var async2 = require('async');
var con = mysql.createConnection({
  host     : 'DB IP주소',
  user     : 'User',
  password : 'PWD',
});

console.log('connect TONYMONY_DB.js');

exports.show_tables = function() {
  //connect_db();
  con.query('show tables', function(error, results){
  if(error){
  }
  //if(result.length > 0){
  console.log(results);
  //}
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

exports.get_statistics_about_age_20th = function(res, callback) {
  con.query('\
            SELECT personalcolor, Count(*) AS 인원 FROM survey_tonymony \
            WHERE (((survey_tonymony.age) Between 20 And 22)) \
            GROUP BY survey_tonymony.personalColor \
            UNION ALL \
            SELECT personalcolor, Count(*) AS 인원 FROM survey_tonymony \
            WHERE (((survey_tonymony.age) Between 23 And 26)) \
            GROUP BY survey_tonymony.personalColor \
            UNION ALL \
            SELECT personalcolor, Count(*) AS 인원 FROM survey_tonymony \
            WHERE (((survey_tonymony.age) Between 27 And 29)) \
            GROUP BY survey_tonymony.personalColor',
    function(err, result) {
      callback(err, result);
    }
  );
}

exports.insert_into_cosmetics = function(made, product, type, value_l, value_a, value_b, callback) {
  var query = "'" + made + "','" + product + "','" + type + "','" + value_l + "','" + value_a + "','" + value_b +"'";
  console.log('화장품 데이터 추가 쿼리 : ', query);

  con.query("INSERT INTO `cosmetics` (`made`, `product`, `type`, `L`, `A`, `B`) VALUES (" + query + ")",
        function(err) {
          callback(err);
        });
}

exports.delete_from_cosmetics = function(id, callback) {
  console.log('화장품 데이터 삭제 쿼리');

  con.query("DELETE FROM `cosmetics` WHERE `Id` = " + "'" + id + "'",
        function(err) {
          callback(err);
        });
}

exports.insert_into_survey_tonymony = function(mID, customID, name, age,
                                                value_l, value_a, value_b,
                                                prefer_season, prefer_image,
                                                bornColor, tone, callback) {
  var query = "'" + mID + "','" + customID + "','" + name + "','" + age + "','"
              + value_l + "','" + value_a + "','" + value_b + "','"
              + (value_b - value_a) + "','" + prefer_season + "','"
              + prefer_image + "','" + bornColor + "','" + tone + "'";
  console.log(query);

  con.query("INSERT INTO `survey_tonymony` (`marketID`, `customID`, `name`, `age`, `L`, `A`, `B`, `BA`, `pallete`, `image`, `bornColor`, `personalColor`) VALUES ("+ query + ")",
        function(err) {
          callback(err);
        }
      );

//console.log("INSERT INTO `survey_tonymony` (`marketID`, `customID`, `name`, `age`, `L`, `A`, `B`, `BA`, `pallete`, `image`, `bornColor`, `personalColor`) VALUES ("+ query + ")");
//console.log("INSERT INTO `survey_tonymony` (`marketID`, `customID`, `name`, `age`, `L`, `A`, `B`, `BA`, `pallete`, `image`, `bornColor`, `personalColor`) VALUES ('A1', '100', '강수정', '49', '62.22', '16.09', '23.87', '7.78', '겨울', 'cold', 'M', '겨울쿨');");
}
/*
connect_db();
con.query('SELECT L, A, B from cosmetics', function(err, rows) {
  console.log(rows[0]);
});
//con.query('CREATE TABLE `cosmetics` (`Id` int(11) NOT NULL,`made` varchar(45) NOT NULL,`product` varchar(45) NOT NULL,`type` varchar(45) NOT NULL,`L` double DEFAULT NULL,`A` double DEFAULT NULL,`B` double DEFAULT NULL,PRIMARY KEY (`Id`,`made`,`product`,`type`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;');
con.end();
*/

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
