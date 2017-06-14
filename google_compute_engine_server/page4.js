var prediction = require('@google-cloud/prediction');

var predictionClient = prediction({
	projectId: 'projectID'
});

var model = predictionClient.model('predictionModel');
var async = require('async');


module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/', function(req, res) {
    async.waterfall([
      function(callback) {
        l = parseFloat(req.body.L);
        a = parseFloat(req.body.A);
        b = parseFloat(req.body.B);
        differencesBwithA = b - a;
        callback(null, l, a, b, differencesBwithA);
      },
      function(l, a, b, differencesBwithA, callback) {
        var query = new Array();
        query[0] = l;
        query[1] = a;
        query[2] = b;
        query[3] = differencesBwithA;
        query[4] = prefer_season;
        query[5] = prefer_image;
        query[6] = bornColor;
        callback(null, query);
      },
      function(query, callback) {
        model.query(query, function(err, results) {
          console.log(query);
          if(!err) {
            console.log(results);
            if(results.winner == 'spring_warm') tone = 'spring';
            else if(results.winner == 'summer_cool') tone = 'summer';
            else if(results.winner == 'autumn_warm') tone = 'autumn';
            else tone = 'winter';

            callback(null, tone);
          }
          else {
            console.log(err);
            callback(null, 'end');
          }
        });
      },
      function(tone, callback) {
        if(tone == 'spring') {
          toneValue = '봄웜';
          if(chroma == 1) subtone = 'spring_pale';
          else if(chroma == 2) subtone = 'spring_light';
          else subtone = 'spring_vivid';
        } else if(tone == 'summer') {
          toneValue = '여름쿨';
          if(chroma == 1) subtone = 'summer_whitish';
          else if(chroma == 2) subtone = 'summer_pale';
          else subtone = 'summer_soft';
        } else if(tone == 'autumn') {
          toneValue = '가을웜';
          if(chroma == 1) subtone = 'autumn_soft';
          else if(chroma == 2) subtone = 'autumn_dull';
          else subtone = 'autumn_deep';
        } else if(tone == 'winter') {
          toneValue = '겨울쿨';
          if(chroma == 1) subtone = 'winter_vivid';
          else if(chroma == 2) subtone = 'winter_deep';
          else subtone = 'winter_dark';
        }
        console.log(tone, toneValue);
        callback(null, 'end');
      }
    ])
  });

  return router;
});
