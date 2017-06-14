var db = require('./TONYMONY_DB.js');
db.connect_db();

module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/', function(req, res) {
    console.log('/page/5 : Sending Tone Result')

    var made;
    var product;

    db.insert_into_survey_tonymony(mID, customID, name, year, l.toFixed(3),
                                  a.toFixed(3), b.toFixed(3), prefer_season_kor,
                                  prefer_image, bornColor, toneValue,
                                  function(err) {
                                    if(err) {
                                      console.log(err);
                                    }
                                    else {
                                      console.log(customID,'번째 데이터 삽입 성공~');
                                      customID++;
                                    }
                                  });
    res.send(subtone);
  });

  return router;
});
