
/* initialization */
var express = require('express');
var mongo = require('mongodb').MongoClient;
var bing = require('node-bing-api')({ accKey: "YHaVJMOWoCR8ZnA6KiVSDYMETlc0NZh47849oAINtKw=" });

var app = express();

var port = process.env.PORT || 3000;
var db_location = 'mongodb://localhost:27017/image_search_db';

/* routing */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static_pages/home.html');
});

app.get('/imagesearch/:keyword', function(req, res) {
    var keyword = req.params.keyword;
    console.log('Keyword: ' + keyword);
    var query = req.query;
    console.log('Parameters: ' + JSON.stringify(query));

    mongo.connect(db_location, function(err, db) {
	if(err) throw(err);

	var search_history = db.collection('search_history');
	var insert_data = {'keyword': keyword, 'date': new Date()};
	search_history.insert(insert_data, function(err, data) {
	    if(err) throw(err);

	    console.log('Insert data: ' + JSON.stringify(insert_data));
	    db.close();
	});
    });

    bing.images(keyword, {skip: query.offset, top: 5}, function(err, result, body) {
	console.log(JSON.stringify(body));

	var search_json = body.d.results.map( function(e) {
	    return {'URL': e.MediaUrl,
		    'Description': e.Title,
		    'Thumbnail': e.Thumbnail.MediaUrl,
		    'Source': e.SourceUrl};
	});

	res.send(search_json);
    });
});

app.get('/latest', function(req, res) {
    mongo.connect(db_location, function(err, db) {
	if(err) throw(err);

	var search_history = db.collection('search_history');
	search_history.find().limit(10).toArray(function(err, docs) {
	    console.log('Latest requests: ' + JSON.stringify(docs));

	    var history_json = docs.map(function(e) {
		return {'keyword': e.keyword, 'date': e.date};
	    });
	    
	    res.send(history_json);
	    db.close();
	});
    });
});

/* special cases */

app.get('/favicon.ico', function(req, res) {
    console.log('piss off, favicon!');
    res.end('piss off, favicon!');
});

app.use(function(req, res) {
    response.writeHead(404, {'Content-Type': 'text-plain' });
    response.end('404!');
});

app.listen(port, function() {
    console.log('Server is running on port ' + port);
});
