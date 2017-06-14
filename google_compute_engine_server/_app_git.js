var express = require('express')
var app = express()
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser')
var request = require('request');
var async = require('async');
var prediction = require('@google-cloud/prediction');
var math = require('math');
var cors = require('cors');

/***********************************************************
*DB 연결
*
*
*
**************************************************************/
var db = require('./TONYMONY_DB.js');
db.connect_db();

var options = {
    key: fs.readFileSync('pem/privkey1.pem'),
    cert: fs.readFileSync('pem/cert1.pem'),
    ca: fs.readFileSync('pem/chain1.pem')
};
/********************************************************************
********************************************************************/

/********************************************************************
*페이스북 메신저 연결
*
*
**************************************************************************/
const PAGE_ACCESS_TOKEN = '페이지토큰';
const imageUrl = '앱 로고'
var port = 443;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

https.createServer(options, app).listen(port, function(){
  console.log("Https server listening on port " + port);
});

app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.write('<h3>Welcome</h3>');
    res.end();
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'Valid Token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else{
          //console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
}

function facebookMsg(name, phone, tone, link) {
  var messageData = {
    recipient: {
      phone_number: phone
    },
    message:{
      attachment:{
        type: 'template',
        payload:{
          template_type:'generic',
          elements:[
             {
              title:name+'님의 피부톤은?',
              image_url: imageUrl,
              subtitle:tone+'입니다.',
              buttons:[
                {
                  "type":"web_url",
                  "url":link,
                  "title":"자세한 결과보기"
                }
              ]
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  });
}
/**************************************************************************
***************************************************************************/

//서버 작동 여부 테스트 라우팅
app.get('/test', function ( req, res ) {

});


/*********************************************************************
*page/1
*POST
*name, birth
*************************************************************************/
var name;
var birth;
var year;
var month;
var bornColor;
var mID = 'A1';
var customID;
db.select_from_survey_tonymony(function(err, rows) {
  customID = rows.length + 1;
});

app.post('/page/1', function ( req, res ) {
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

/*********************************************************************
*page/2
*POST
*prefer_season
*************************************************************************/
var prefer_season;
var prefer_season_kor;

app.post('/page/2', function ( req, res) {
  prefer_season = req.body.prefer_season;

  if(prefer_season == 'spring') prefer_season_kor = '봄';
  else if(prefer_season == 'summer') prefer_season_kor = '여름';
  else if(prefer_season == 'autumn') prefer_season_kor = '가을';
  else prefer_season_kor = '겨울';

  console.log('/page/2 :', prefer_season, prefer_season_kor);
});

/*********************************************************************
*page/3
*POST
*prefer_image, chroma
*************************************************************************/
var prefer_image;
var chroma;

app.post('/page/3', function ( req, res) {
  prefer_image = req.body.prefer_image;

  if(prefer_image == 'tender' || prefer_image == 'cool' || prefer_image == 'calm' || prefer_image == 'passionate') {
    chroma = 1;
  } else if(prefer_image == 'friendly' || prefer_image == 'chic' || prefer_image == 'sensible' || prefer_image == 'cold') {
    chroma = 2;
  } else chroma = 3;

  console.log('/page/3 :', prefer_image);
  console.log('chroma : ', chroma);
});

/*********************************************************************
*page/4
*POST
*tone, subtone
*************************************************************************/
var tone;
var toneValue;
var subtone;
var l, a, b;
var differencesBwithA;

var predictionClient = prediction({
	projectId: 'projectID'
});

var model = predictionClient.model('predictionModel');

app.post('/page/4', function ( req, res ) {
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

/*********************************************************************
*page/
*POST
*send subtone;
*************************************************************************/
app.post('/page/5', function(req, res, next) {
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

/*********************************************************************
*page/6
*POST
*phone
**********************************************************************/
var phone;
var link;

app.post('/page/6', function(req, res) {
  async.waterfall([
    function(callback) {
      phone = '+'+req.body.phone;
      console.log('/page/6 :', phone);
      callback(null, phone);
    },
    function(phone, callback) {
      link = 'https://storage.googleapis.com/tonymonytest1/'+subtone+'.png';
//      link = 'https://storage.googleapis.com/tonymonytest1/autumn_soft.png';
      callback(null, phone, toneValue, link);
    },
    function(phone, toneValue, link, callback) {
      facebookMsg(name, phone, toneValue, link);
      console.log(tone, toneValue);
      console.log(name, phone, toneValue, link);
      console.log("페북 보냈음~");
    }
  ]);
});

/*********************************************************************
*page/7
*POST
*statistics가을겨울봄여름 순서로 불러와짐
***********************************************************************/
app.post('/page/7', function(req, res) {
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

app.post('/page/8', function(req, res, next) {
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

app.post('/page/9', function(req, res, next) {

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

function getDistance(l, a, b) {
  return math.sqrt(math.pow(l) + math.pow(a) + math.pow(b));
}


/*********************************************************
*page/11
*manage cosmetics database
*Id made product L A B
***********************************************************/
app.post('page/11/login', function(req, res, next) {
  console.log('관리자 로그인 시도');
  const admin_pwd = 1;
  if(req.body.password == admin_pwd) res.send('success');
  else res.send('fail');
});

app.post('/page/11/show', function(req, res, next) {
  console.log('DB관리페이지 - 화장품 목록 로딩');
  db.select_from_cosmetics(res, function(err, rows) {
    res.send(rows);
  });
});

app.post('/page/11/insert', function(req, res, next) {
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

app.post('/page/11/delete', function(req, res, next) {
  console.log('DB관리페이지 - 화장품 데이터 삭제');

  db.delete_from_cosmetics(req.body.id, function(err) {
    console.log(err);
    res.send(err);
  });
});
