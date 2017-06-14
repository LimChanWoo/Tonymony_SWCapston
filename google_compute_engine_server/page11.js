var db = require('./TONYMONY_DB.js');
db.connect_db();

module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  app.post('page/11/login', function(req, res, next) {
    console.log('관리자 로그인 시도');
    const admin_pwd = 1;
    if(req.body.password == admin_pwd) res.send('success');
    else res.send('fail');
  });

  router.post('/show', function(req, res, next) {
    console.log('DB관리페이지 - 화장품 목록 로딩');
    db.select_from_cosmetics(res, function(err, rows) {
      res.send(rows);
    });
  });

  router.post('/insert', function(req, res, next) {
    console.log('DB관리페이지 - 화장품 데이터 추가');
    console.log(req.body.made, req.body.product);
  //  var id = req.body.id;
    var made = req.body.made + ' ';
    var product = req.body.product + ' ';
    var type = req.body.type +  ' ';
    var value_l = req.body.L * 1;
    var value_a = req.body.A * 1 ;
    var value_b = req.body.B * 1;

    db.insert_into_cosmetics(made, product, type, value_l, value_a, value_b, function(err) {
      console.log(err);
      res.send(err);
    });
  });

  router.post('/delete', function(req, res, next) {
    console.log('DB관리페이지 - 화장품 데이터 삭제');

    db.delete_from_cosmetics(req.body.id, function(err) {
      console.log(err);
      res.send(err);
    });
  });


  return router;
});
