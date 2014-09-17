angular.module('app').controller('mainController', function ($scope, $location, identity) {

    $scope.identity = identity;

    $scope.launchGame = function(){
        $location.path('/play');
    }
});