module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/page/8', function(req, res, next) {
    console.log('/page/8 : Sending your L, A, B');
  /*
    var msg = {
      L : 31,
      A : 55,
      B : 14
    };
    res.json(msg);
  */
    res.send(l+ '/' + a + '/' + b);
  });

  return router;
});
