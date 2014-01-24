var express = require('express'),
	app = express(),
	_ = require('underscore'),
	Q = require('q')
	request = require('request'),
	Knex = require('knex'),
	Data = require('./Data');

var	subreddit = "aww";

var knex = Knex.initialize({
	client: 'sqlite3',
	connection: {
		filename: "./mydb.sqlite"
	}
});
// database handle
var Things = Data(knex);


app.use(express.static('./public'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

app.post('/thread', function(req, res) {
		var url = 'http://www.reddit.com' + item.data.permalink + '.json';
		request(url, function (err, response, body) {
			if (err) {
				commentThen.reject(err);
			};
			var comms = JSON.parse(body)[1].data.children;
			var threadWithComments = _.extend(thread_data, {comments: comms});
			console.log('resolving thread:' + threadWithComments.title);
			commentThen.resolve( threadWithComments );
		});
});

app.get('/titles', function (req, res) {

	request('http://www.reddit.com/r/' + subreddit + '.json', function (err, response, body) {
		var redditResponse = JSON.parse(body);

		//get the top threads
		var threads = _.chain(redditResponse)
		.pick(redditResponse, 'data')
		.value().data.children;

		// get the comment threads for each one
		threads = _.map(threads, function (item) {
			var commentThen = Q.defer();
			var thread_data = _.pick(item.data, 'score', 'title', 'created_utc', 'permalink');
			return thread_data;
		});

		res.send(threads);
	});
})

app.listen(3000);
console.log('Server started on port 3000')