module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/', function(req, res) {
    prefer_image = req.body.prefer_image;

    if(prefer_image == 'tender' || prefer_image == 'cool' || prefer_image == 'calm' || prefer_image == 'passionate') {
      chroma = 1;
    } else if(prefer_image == 'friendly' || prefer_image == 'chic' || prefer_image == 'sensible' || prefer_image == 'cold') {
      chroma = 2;
    } else chroma = 3;

    console.log('/page/3 :', prefer_image);
    console.log('chroma : ', chroma);
  });

  return router;
});
