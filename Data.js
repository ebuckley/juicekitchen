var _ = require('underscore');
module.exports = function (connection) {

	var db = connection;
	var Service = {};
	var Images = {};

	var	createIfExists = function  (tablename, cb) {
		return db.schema.hasTable(tablename).then(function (exists) {
			if (!exists) {
				console.log(tablename + " Created");
				return db.schema.createTable(tablename, cb);
			} else {
				console.log(tablename + " Already exists");
			}
		});
	};

	Service.createTables = function () {
		var images = function() {
			return createIfExists('images', function (t) {
				t.increments('id').primary();
				t.string('path').unique();
				t.text('data');
			});
		};
		var matches = function () {
			return createIfExists('matches', function (t) {
				t.increments('id').primary();
				t.string('title');
			});
		}
		return images().then(function (images) {
			return matches();
		});
	};

	Service.dropTables = function () {
		return db.schema.dropTable('images').then(function () {
			console.log('dropped images')
			return db.schema.dropTable('matches').then(function () {
				console.log('dropped matches');
			});
		})
	};

	//Returns a promise to create a new row in the table
	Images.create = function ( path, data) {
		return db('images').insert({
			path: path,
			data: JSON.stringify(data)
		});
	};

	//basically preforms a where with given args
	Images.get = function (whereargs) {
		var thener = function (models) {

			_.map(models, function (model) {
				model.data = JSON.parse(model.data);
				return model;
			});
			return models;
		};
		if (whereargs === undefined) {
			return db('images').select().then(thener);
		}
		return db('images').where(whereargs).then(thener);
	};

	Service.Images = Images;
	return Service;
}