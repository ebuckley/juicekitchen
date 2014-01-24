angular.module('app', [])
.controller('PageController', function ($scope, QuestionService) {
	$scope.title = "IT WORKS.... kinda";
	$scope.totalScore = 0;
	$scope.guessMessage = "";

	QuestionService.getComments().success(function (data) {
		$scope.threads = data;
		$scope.thread = $scope.threads.pop();
	});

	$scope.datify = function (arg) {
		return "Created: " + moment.unix(arg).fromNow();
	}
	$scope.makeGuess = function () {
		var guess = Number($scope.guess);
		if (! _.isNaN(guess) && _.isNumber(guess)) {

			var delta = $scope.thread.score - guess;
			var scoreModifier = ($scope.thread.score - Math.abs(delta)) / $scope.thread.score;
			if (delta > 0) {
				$scope.guessMessage = 'Your guess is too damn low';
			} else if (delta === 0) {
				$scope.totalScore *= 10;
				$scope.guessMessage = 'You fucking hacker';
			} else {
				$scope.guessMessage = 'Your guess is too damn high';
			} 
			$scope.totalScore += 1000 * scoreModifier;

			$scope.thread = $scope.threads.pop();
		}
	};
})
.service('QuestionService',function ($http, $q) {
	var Service = {};

	//Arbitrailly grab the next question
	Service.getComments = function () {
		return $http({
			method: 'GET',
			url: '/titles'
		});
	};
	return Service;
});