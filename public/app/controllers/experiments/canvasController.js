angular.module('app').controller('canvasController', function($scope){

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight - 160;
    canvas.width = window.innerWidth /1.6;
    $scope.radianAnge = Math.PI/20;
		var sin = Math.sin($scope.radianAnge);
		var cos = Math.cos($scope.radianAnge);

    $scope.x;
    $scope.y;
    $scope.majorTransform = [1.12,1.12,1.12,1.12];
    $scope.minorTransform = [1,1,1,1];

    $scope.isMajorTransform = false;
    $scope.isMinorTransform = false;
    $scope.currentMajorTransform = -1;
    $scope.currentMinorTransform = -1;

    $scope.drawBackground = function(){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width /2.6, 0);
        ctx.save();

				for (var i=0; i <=40; i++){
					$scope.drawDiamondCircle(150, 30);
					ctx.transform(cos/$scope.majorTransform[0], sin/$scope.majorTransform[1],
            -sin/$scope.majorTransform[2], cos/$scope.majorTransform[3], 0, 0);
				}

				ctx.restore();
    }

    $scope.drawDiamondCircle = function(x,y){
        ctx.translate(x,y);

				for (var i=0; i <=80; i++){
					var r = Math.floor(120);
				  //var g = Math.floor(60 + 195* Math.random());
					//var b = Math.floor(200 + 55* Math.random());
          var g = Math.floor(60 + 195* (1- (1/i+1)) );
          var b = Math.floor(200 + 55* (1- (1/i+1)));
					ctx.fillStyle = "rgb(" + r + "," + g + "," + b +")";
					ctx.beginPath();

					ctx.arc(5,5,5,0,2 * Math.PI,true);
					ctx.fill();
					ctx.closePath();
					//ctx.fillRect(0,0,10,10);
					ctx.transform(cos/$scope.minorTransform[0], sin/$scope.minorTransform[1],
             -sin/$scope.minorTransform[2], cos/$scope.minorTransform[3], 10, 10);
				}
    }

    $scope.updateState = function(){

        $scope.$apply(function () {
          if ($scope.isMinorTransform){
              $scope.minorTransform[$scope.currentMinorTransform] += 0.01;

              if ($scope.minorTransform[$scope.currentMinorTransform] > 2.5 || $scope.currentMinorTransform > 3)
                $scope.switchMinorTransform();
            }

          if ($scope.isMajorTransform){
              $scope.majorTransform[$scope.currentMajorTransform] += 0.01;

              if ($scope.majorTransform[$scope.currentMajorTransform] > 2.5 || $scope.currentMajorTransform > 3)
                $scope.switchMajorTransform();
            }
        });
    }

    $scope.switchMajorTransform = function(){
      $scope.majorTransform = [1.12,1.12,1.12,1.12];

      if ($scope.currentMajorTransform > 3)
        $scope.currentMajorTransform = 0;
      else
        $scope.currentMajorTransform ++;

      $scope.majorTransform[$scope.currentMajorTransform] = 0.1;
    }

    $scope.switchMinorTransform = function(){
      $scope.minorTransform = [1,1,1,1]

      if ($scope.currentMinorTransform > 3)
        $scope.currentMinorTransform = 0;
      else
        $scope.currentMinorTransform ++;

      $scope.minorTransform[$scope.currentMinorTransform] = 0.1;
    }

    $scope.toggleMajorTransform = function(){
      $scope.majorTransform = [1.12,1.12,1.12,1.12];
      $scope.isMajorTransform = !$scope.isMajorTransform;
      $scope.currentMajorTransform = -1;

      if ($scope.isMajorTransform)
        $scope.switchMajorTransform();
    }

    $scope.toggleMinorTransform = function(){
      $scope.minorTransform = [1,1,1,1];
      $scope.isMinorTransform = !$scope.isMinorTransform;
      $scope.currentMinorTransform = -1;

      if ($scope.isMinorTransform)
        $scope.switchMinorTransform();
    }

    $scope.pause = function(isMinor){
      if (!isMinor)
        $scope.isMajorTransform = false;
      if (!!isMinor)
        $scope.isMinorTransform = false;
    }

    $scope.animate = function() {
        requestAnimFrame($scope.animate);
        $scope.drawBackground();
        if ($scope.isMinorTransform || $scope.isMajorTransform)
          $scope.updateState();
    }

    $scope.animate();
})
