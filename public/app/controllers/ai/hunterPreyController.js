angular.module('app').controller('hunterPreyController', function($scope){

  $scope.gridSize = 100
  $scope.hunterVision = 8;
  $scope.hunterRange = 3;
  $scope.preySize = 10;
  $scope.preyRange = 2;

  function Hunter(){
    this.vision = $scope.hunterVision;
    this.range = $scope.hunterRange;
  }

  Hunter.prototype.act = function(input){

  };

  $scope.hunter = new Hunter();
});
