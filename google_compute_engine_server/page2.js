module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/page/2', function ( req, res) {
    prefer_season = req.body.prefer_season;

    if(prefer_season == 'spring') prefer_season_kor = '봄';
    else if(prefer_season == 'summer') prefer_season_kor = '여름';
    else if(prefer_season == 'autumn') prefer_season_kor = '가을';
    else prefer_season_kor = '겨울';

    console.log('/page/2 :', prefer_season, prefer_season_kor);
  });

  return router;
});
