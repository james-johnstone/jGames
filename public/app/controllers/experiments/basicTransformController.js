angular.module('app').controller('basicTransformController', function($scope){

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight/ 1.8;
    canvas.width = window.innerWidth /1.6;

    $scope.squareSize = Math.min(canvas.width, canvas.height) / 2.5;
    $scope.majorTransform = [1,0,0,1,0,0];

    $scope.canvasXOffSet = (canvas.width /2) - ($scope.squareSize/2) ;
    $scope.canvasYOffSet = (canvas.height /2) - ($scope.squareSize/2) ;

    $scope.maxX = $scope.canvasXOffSet * 2;
    $scope.maxY = $scope.canvasYOffSet * 2;

    $scope.drawBackground = function(){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.translate($scope.canvasXOffSet, $scope.canvasYOffSet);
        ctx.save();

        ctx.transform($scope.majorTransform[0],$scope.majorTransform[1],
            $scope.majorTransform[2], $scope.majorTransform[3], $scope.majorTransform[4], $scope.majorTransform[5]);

        ctx.beginPath();
        ctx.rect(0,0, $scope.squareSize,$scope.squareSize);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    function animate() {
        requestAnimFrame(animate);
        $scope.drawBackground();
    }

    animate();
})
