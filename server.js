var express = require('express'),
	app = express(),
	_ = require('underscore'),
	Q = require('q')
	request = require('request'),
	Knex = require('knex'),
	Scraper = require('./Scraper'),
	Data = require('./Data');

var	subreddit = "aww";

var knex = Knex.initialize({
	client: 'sqlite3',
	connection: {
		filename: "./mydb.sqlite"
	}
});

// database handle
var DB = Data(knex);
DB.createTables();
var scraper = Scraper(DB);

app.use(express.static('./public'));
app.use('/images', express.static('./images'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});
app.get('/drop', function (req, res) {
	DB.dropTables().then(function (arr) {
		res.send(arr);
	}, function (err) {
		res.status(400).send(err);
	});
});
app.get('/scrape/:sub', function (req, res) {

	scraper.getSub(req.params.sub).then(function (threads) {

		threads =_.chain(threads.objects).map(function (item) {
			var image = scraper.getImage(item.id, item.url);
			if (image !== 'error') {
				DB.Images.create(image, item).then(function (id) {
					console.log('created image row ' + id);
				}, function (err) {
					console.log('error creating image row ' + err);
				});
				return item;
			}
		}).filter(function (item) {
			if (item === undefined) {
				return false;
			} else {
				return true;
			}
		}).value();
		res.send({
			meta: {
				count: threads.length
			},
			objects: threads
		});

	}, function (err) {
		res.status(400).send(err);
	});
});

app.get('/images', function (req, res) {
	DB.Images.get().then(function (data) {
		res.send(data);
	}, function (err) {
		res.status(400).send(err);
	});
});

app.listen(3000);
console.log('Server started on port 3000')