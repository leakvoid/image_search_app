/* initialization */
var express = require('express');
var mongo = require('mongodb').MongoClient;
var app = express();

var port = process.env.PORT || 3000;
var db_location = 'mongodb://localhost:27017/image_search_db';

/* routing */

app.get('/', function(req, res) {
    res.send('image search test!');
});

app.listen(port, function() {
    console.log('Server is running on port ' + port);
});
