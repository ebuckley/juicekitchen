angular.module('app', [])
.controller('PageController', function ($scope, MatchService) {
	$scope.game = {
	};
	
	MatchService.getImages().success(function (data) {
		$scope.images = data;
		$scope.game = {};
		$scope.game.totalScore = 0;
		$scope.game.streak = 1;
		initGameState(data);
	});

	/**
	 * initialize game state, does not reset score,
	 */
	var initGameState = function (data) {
		console.log(data);
		$scope.game.images = _.sample(data.objects, 5);
		$scope.game.title = _.sample($scope.game.images, 1)[0]
							.data.title;
		$scope.game.activeIndex = Math.floor($scope.game.images.length / 2);
		updateGameState();
	};

	/**
	 * Update state
	 * invokes a $digest, changes the active image.
	 */
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
		$scope.$digest();
	};
	
	$scope.pad = function (n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	$scope.goLeft = function () {
		$scope.game.activeIndex -= 1;
		updateGameState();
	};
	$scope.goRight = function () {
		$scope.game.activeIndex += 1;
		updateGameState();
	};

	/**
	 * answer the question
	 */
	$scope.answer = function() {
		var active = $scope.game.active;
		var title = $scope.game.title;

		if (active.data.title === title) {
			var score_delta = 10 * $scope.game.streak;
			$scope.game.totalScore += score_delta;

			var streak = "";
			if ($scope.game.streak > 1) {
				var streaktypes = [
					'double!',
					'triple!',
					'ultra!',
					'rampage!',
					'wicked sick!'
				];

				if ($scope.game.streak > streaktypes.length) {
					streak = streaktypes[streaktypes.length];
				} else {
					streak = streaktypes[$scope.game.streak - 2];
				}
			}
			var msg = 'You got ' + score_delta + ' doge!  ' + streak;
			alert(msg);
			$scope.game.streak +=1;
		} else {
			console.log('got it wrong');
			$scope.game.streak = 1;
		}

		initGameState($scope.images);
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
			Mousetrap.bind(attr.on, scope.invoke);
		}
	};
});