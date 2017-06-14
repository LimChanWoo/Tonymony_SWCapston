var async = require('async');

var db = require('./TONYMONY_DB.js');
db.connect_db();

module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/page/9', function(req, res, next) {

    db.select_from_cosmetics(res, function(err, rows) {
      async.waterfall([
        function(callback) {
          count = rows.length;
          console.log('L값 : ', l, ' A값 : ', a, ' B값 : ', b);
          console.log('화장품 데이터베이스 개수 : ', count);

          var distance = new Array();
          var min = 9999;
          var diff_L;
          var diff_A;
          var diff_B;
          var index;

          for(var i = 0; i < count; i++) {
            diff_L = l - rows[i].L;
            diff_A = a - rows[i].A;
            diff_B = b - rows[i].B;
            distance[i] = math.sqrt(math.pow(diff_L, 2) + math.pow(diff_A, 2) + math.pow(diff_B, 2));
  //        console.log(distance[i]);
            if(min > distance[i]) {
              min = distance[i];
              index = i;
            }
          }
          console.log('ID : ', index, rows[index].made, rows[index].product);
          console.log(subtone+'/'+rows[index].made+'/'+rows[index].product);
          made = rows[index].made;
          product = rows[index].product;

          callback(null, made, product);
        },
        function(made, product, callback) {
          var link_ai = 'https://storage.googleapis.com/tonymonytest1/cosmetic_image/'+made+'_'+product+'_ai.PNG';
          var link_product = 'https://storage.googleapis.com/tonymonytest1/cosmetic_image/'+made+'_'+product+'.PNG';
          var encode_link_ai = link_ai.replace(/(\s)/gi, "%20");
          var encode_link_product = link_product.replace(/(\s)/gi, "%20");

          console.log(made+'@'+product);
          console.log(encode_link_ai);
          console.log(encode_link_product);

          var msg = {
            made : made,
            product : product,
            ai_link : encode_link_ai,
            product_link : encode_link_product
          };

          res.send(JSON.stringify(msg, null, ' '));
          console.log(JSON.stringify(msg, null, ' '));
    //        res.send(subtone+'@'+made+'@'+product+'@'+encode_link_ai+'@'+encode_link_product);
          callback(null, 'end');
        }
      ]);
    });
  });

  return router;
});

function getDistance(l, a, b) {
  return math.sqrt(math.pow(l) + math.pow(a) + math.pow(b));
}
