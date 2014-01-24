var request = require('request'),
	Q = require('q'),
	_ = require('underscore'),
	fs = require('fs'),
	uuid = require('node-uuid'),	
	path = require('path');

var Scraper  = function  (data) {
	var Self = {};
	Self.getImage = function ( filename , url ) {
		var defer = Q.defer();
		var ext = path.extname(url);
		if (ext === '') {
			console.log("couldn't parse " + url);
			return "error";
		} else if (ext.split('?').length > 1) {
			ext = ext.split('?')[0];
		}

		filename = path.normalize('./images/' + filename + ext);
		console.log('saving image: ' + filename);
		request(url).pipe(fs.createWriteStream(filename));
		return filename;
	};
	Self.getSub = function ( subreddit ) {
		var defer = Q.defer();
		var url = 'http://reddit.com/r/' + subreddit + '.json?count=100';
		console.log('getting ' + url);
		request(url , function (err, response, body) {
			if (err) {
				defer.reject(err);
			}
			var redditResponse = JSON.parse(body);

			//get the top threads
			var threads = _.chain(redditResponse)
			.pick(redditResponse, 'data')
			.value().data.children;

			// get the comment threads for each one
			threads = _.chain(threads).filter(function (item) {
				if ( item.data.domain === 'i.imgur.com' ||
					 item.data.domain === 'imgur.com' ) {
					return true;
				}
				return false;
			}).map(function (item) {
				var thread_data = _.pick(item.data,
					'score',
					'title',
					'created_utc',
					'permalink',
					'domain',
					'url',
					'id');
				return thread_data;
			}).value();
			defer.resolve({
				meta: {
					count: threads.length,
				},
				objects: threads
			});
		});
		return defer.promise;
	}

	return Self;
};


module.exports = Scraper;