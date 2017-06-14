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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

https.createServer(options, app).listen(port, function(){
  console.log("Https server listening on port " + port);
});
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

//라우팅
var page1 = require('./page1.js')(app);
app.use('/page/1', page1);

var page2 = require('/page2.js')(app);
app.use('/page/2', page2);

var page3 = require('/page3.js')(app);
app.use('/page/3', page3);

var page4 = require('/page4.js')(app);
app.use('/page/4', page4);

var page5 = require('/page5.js')(app);
app.use('/page/5', page5);

var page6 = require('/page6.js')(app);
app.use('/page/6', page6);

var page7 = require('/page7.js')(app);
app.use('/page/7', page7);

var page8 = require('/page8.js')(app);
app.use('/page/8', page8);

var page9 = require('/page9.js')(app);
app.use('/page/9', page9);

var page11 = require('/page11.js')(app);
app.use('/page/11', page11);

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

/*********************************************************************
*page/2
*POST
*prefer_season
*************************************************************************/
var prefer_season;
var prefer_season_kor;

/*********************************************************************
*page/3
*POST
*prefer_image, chroma
*************************************************************************/
var prefer_image;
var chroma;

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


/*********************************************************************
*page/
*POST
*send subtone;
*************************************************************************/


/*********************************************************************
*page/6
*POST
*phone
**********************************************************************/
var phone;
var link;

/*********************************************************************
*page/7
*POST
*statistics가을겨울봄여름 순서로 불러와짐
***********************************************************************/

/******************************************************************
*page/8
*POST
*
***************************************************************/

/******************************************************************
*page/9
*POST
*
***************************************************************/


/*********************************************************
*page/11
*manage cosmetics database
*Id made product L A B
***********************************************************/
