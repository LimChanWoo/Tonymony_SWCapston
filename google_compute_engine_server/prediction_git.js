/******************************************************
*Google Prediction API를 통해 만든 모델의 성능을 테스트
*******************************************************/
var prediction = require('@google-cloud/prediction');

//Test value
var l = 72.05;
var a = 12.13;
var b = 17.59;
var differencesBwithA = 5.46;
var prefer_image = 'sensible';
var prefer_season = 'summer';
var born_color = 'YG';

//make query in array
var query = new Array();
query[0] = l;
query[1] = a;
query[2] = b;
query[3] = differencesBwithA;
query[4] = prefer_season;
query[5] = prefer_image;
query[6] = born_color;

//bind your projcet
var predictionClient = prediction({
	projectId: 'your project ID'
});

//call your prediction model
var model = predictionClient.model('your project Number');

//query to prediction model
model.query(query, function(err, results) {
	console.log(query);
	if(!err) {
		console.log(results);
	}
	else console.log(err);
});
