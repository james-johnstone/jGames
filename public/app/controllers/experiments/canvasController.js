angular.module('app').controller('canvasController', function($scope){

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight - 160;
    canvas.width = window.innerWidth /1.6;

		var sin = Math.sin(Math.PI/20);
		var cos = Math.cos(Math.PI/20);

    $scope.x;
    $scope.y;
    $scope.majorTransform = [1.12,1.12,1.12,1.12];
    $scope.minorTransform = [1,1,1,1];

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

    function animate() {
        requestAnimFrame(animate);
        $scope.drawBackground();
    }

    animate();
})
