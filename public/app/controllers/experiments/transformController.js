angular.module('app').controller('transformController', function($scope, $timeout){

  $scope.isTransform =false;

  $scope.toggleTransform = function(){
      $scope.isTransform = !$scope.isTransform;

      $timeout(function(){
        $scope.isTransform = !$scope.isTransform;
      }, 2500);
  }
})
