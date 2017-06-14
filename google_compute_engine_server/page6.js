var async = require('async');

module.exports =  function ( app ) {

  var express = require('express');
  var router = express.Router();

  router.post('/', function(req, res) {
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

  return router;
});

const PAGE_ACCESS_TOKEN = '페이지토큰';
const imageUrl = '앱 로고'

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
