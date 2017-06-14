module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/', function(req, res) {
    name = req.body.name;
    birth = req.body.birth;

    month = parseInt((birth / 100) % 100);
    year = 118 - parseInt(birth / 10000);

    if(month == 1) bornColor = 'R';
    else if(month == 2) bornColor = 'RO';
    else if(month == 3) bornColor = 'O';
    else if(month == 4) bornColor = 'Y';
    else if(month == 5) bornColor = 'YG';
    else if(month == 6) bornColor = 'G';
    else if(month == 7) bornColor = 'BG';
    else if(month == 8) bornColor = 'T';
    else if(month == 9) bornColor = 'B';
    else if(month == 10) bornColor = 'I';
    else if(month == 11) bornColor = 'P';
    else if(month == 12) bornColor = 'M';

    console.log('/page/1 : ', name, birth);
    console.log('month : ', month);
    console.log('bornColor : ', bornColor);
  });

  return router;
});
