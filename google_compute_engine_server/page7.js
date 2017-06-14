var db = require('./TONYMONY_DB.js');
db.connect_db();

module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/page/7', function(req, res) {
    db.get_statistics_about_age_20th(res, function(err, rows) {
      var early = rows[0].인원 + rows[1].인원 + rows[2].인원 + rows[3].인원;
      var mid = rows[4].인원 + rows[5].인원 + rows[6].인원 + rows[7].인원;
      var late = rows[8].인원 + rows[9].인원 + rows[10].인원 + rows[11].인원;

      var msg = {
        이십대 : {
          초반 : {
            봄웜 : rows[2].인원,
            여름쿨 : rows[3].인원,
            가을웜 : rows[0].인원,
            겨울쿨 : rows[1].인원
          },
          중반 : {
            봄웜 : rows[6].인원,
            여름쿨 : rows[7].인원,
            가을웜 : rows[4].인원,
            겨울쿨 : rows[5].인원
          },
          후반 : {
            봄웜 : rows[10].인원,
            여름쿨 : rows[11].인원,
            가을웜 : rows[8].인원,
            겨울쿨 : rows[9].인원
          }
        }
      }
      res.send(JSON.stringify(msg, null, ' '));
      //res.json(rows);
    });
  });

  return router;
});
