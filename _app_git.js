var express = require('express')
var app = express()
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser')
var request = require('request');
var async = require('async');
var prediction = require('@google-cloud/prediction');
var math = require('math');

var db = require('./TONYMONY_DB.js');
db.connect_db();

var options = {
    key: fs.readFileSync(privatekey),
    cert: fs.readFileSync(cert),
    ca: fs.readFileSync(ca)
};

const PAGE_ACCESS_TOKEN = page_access_token
const imageUrl = logo.png;
var port = 443;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    if (req.query['hub.verify_token'] === verify_token) {
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

app.get('/test', function ( req, res ) {
  db.select_from_cosmetics(function(err, rows) {
    l = 75.212515;
    a = 18.9594;
    b = 27.18943;
    count = rows.length;
//    console.log('L값 : ', l, ' A값 : ', a, ' B값 : ', b);
//    console.log('화장품 데이터베이스 개수 : ', count);

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
      console.log(distance[i]);
      if(min > distance[i]) {
        min = distance[i];
        index = i;
      }
    }
    console.log('ID : ', index, rows[index].made, rows[index].product);
  });
});

function getDistance(l, a, b) {
  return math.sqrt(math.pow(l) + math.pow(a) + math.pow(b));
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


/*********************************************************************
*page/1
*POST
*name, birth
*************************************************************************/
var name;
var birth;
var month;
var bornColor;

app.post('/page/1', function ( req, res ) {
  name = req.body.name;
  birth = req.body.birth;

  month = parseInt((birth / 100) % 100);

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

app.post('/page/2', function ( req, res) {
  prefer_season = req.body.prefer_season;

  console.log('/page/2 :', prefer_season);
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
var subtone = 'autumn_soft';
var l, a, b;
var differencesBwithA;

var predictionClient = prediction({
	projectId: projectId
});

var model = predictionClient.model(predictionModel);

app.post('/page/4', function ( req, res ) {
  async.waterfall([
    function(callback) {
      l = req.body.L;
      a = req.body.A;
      b = req.body.B;
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
          tone = results.winner;
        }
        else console.log(err);
      });
      callback(null, tone);
    },
    function(tone, callback) {
      if(tone == 'spring') {
        if(chroma == 1) subtone = 'spring_pale';
        else if(chroma == 2) subtone = 'spring_light';
        else subtone = 'spring_vivid';
      } else if(tone == 'summer') {
        if(chroma == 1) subtone = 'summer_whitish';
        else if(chroma == 2) subtone = 'summer_pale';
        else subtone = 'summer_soft';
      } else if(tone == 'autumn') {
        if(chroma == 1) subtone = 'autumn_soft';
        else if(chroma == 2) subtone = 'autumn_dull';
        else subtone = 'autumn_deep';
      } else if(tone == 'winter') {
        if(chroma == 1) subtone = 'winter_vivid';
        else if(chroma == 2) subtone = 'winter_cold';
        else subtone = 'winter_dark';
      }
      callback(null, 'end');
    }
  ])
});

/*********************************************************************
*page/
*POST
*send subtone;
*************************************************************************/
app.post('/page/5', function(req, res) {
  console.log('/page/5 : Sending Tone Result')

//  l = 75.212515;
//  a = 18.9594;
//  b = 27.18943;
  var made;
  var product;

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
    //      console.log(distance[i]);
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
        var link_ai = ai_imageurl;
        var link_product = product_imageurl;
        var encode_link_ai = link_ai.replace(/(\s)/gi, "%20");
        var encode_link_product = link_product.replace(/(\s)/gi, "%20");

        console.log(subtone+'@'+made+'@'+product);
        console.log(encode_link_ai);
        console.log(encode_link_product);
        res.send(subtone+'@'+made+'@'+product+'@'+encode_link_ai+'@'+encode_link_product);
        callback(null, 'end');
      }
    ]);
  });
});

/*********************************************************************
*page/6
*POST
*phone
**********************************************************************/
var phone;
var toneValue;
var link;

app.post('/page/6', function(req, res) {
  async.waterfall([
    function(callback) {
      phone = '+'+req.body.phone;
      console.log('/page/6 :', phone);
      callback(null, phone);
    },
    function(phone, callback) {
      link = imageurl;
      if(tone == 'spring') toneValue = '봄웜';
      else if(tone == 'summer') toneValue = '여름쿨';
      else if(tone == 'autumn') toneValue = '가을웜';
      else toneValue = '겨울쿨';

      callback(null, phone, toneValue, link);
    },
    function(phone, toneValue, link, callback) {
      facebookMsg(name, phone, toneValue, link);
      console.log(name, phone, toneValue, link);
      console.log("페북 보냈음~");
    }
  ]);
});

/*********************************************************************
*page/7
*POST
*phone
***********************************************************************/
