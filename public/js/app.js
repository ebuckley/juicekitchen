angular.module('app', [])
.controller('PageController', function ($scope, MatchService) {
	$scope.game = {
	};
	
	MatchService.getImages().success(function (data) {
		$scope.images = data;
		$scope.game = {};
		$scope.game.totalScore = 0;
		$scope.game.images = _.sample(data, 5);
		$scope.game.title = _.sample($scope.game.images, 1)[0].data.title;
		$scope.game.activeIndex = Math.floor($scope.game.images.length / 2);
		updateGameState();

	});

	var updateGameState = function () {
		$scope.game.activeIndex = Math.abs($scope.game.activeIndex % $scope.game.images.length);
		$scope.game.active = $scope.game.images[$scope.game.activeIndex];

		if (($scope.game.activeIndex - 1) > 0) {
			$scope.game.previous = $scope.game.images[$scope.game.activeIndex - 1];
		} else {
			$scope.game.previous = {url:'blank.png'};
		}

		if (($scope.game.activeIndex + 1) < $scope.game.images.length) {
			$scope.game.next = $scope.game.images[$scope.game.activeIndex + 1];
		} else {
			$scope.game.next = {url:'blank.png'};
		}
		console.log($scope.game);
		$scope.$digest();
	};

	$scope.datify = function (arg) {
		return "Created: " + moment.unix(arg).fromNow();
	};
	
	$scope.goLeft = function () {
		$scope.game.activeIndex -= 1;
		updateGameState();
	};
	$scope.goRight = function () {
		$scope.game.activeIndex += 1;
		updateGameState();
	};
	$scope.answer = function() {
		console.log('ANSWER');
	};
})
.service('MatchService',function ($http, $q) {
	var Service = {};

	//Arbitrailly grab the next question
	Service.getImages = function () {
		return $http({
			method: 'GET',
			url: '/images'
		});
	};
	return Service;
})
.directive('keybinding', function () {
	return {
		restrict: 'E',
		scope: {
			invoke: '&'
		},
		link: function (scope, el, attr) {
			console.log('linked a directive!');
			Mousetrap.bind(attr.on, scope.invoke);
		}
	};
});