angular.module('app').controller('canvasPlotController', function($scope){

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  canvas.height = window.innerHeight - 160;
  canvas.width = window.innerWidth /1.6;
  var delta = 0.55;

  function Point(x,y,z){
    this.coords =[x,y,z];
  }

  function Line(from, to){
    this.from = from;
    this.to = to;
  }

  Point.prototype.rotate = function(x,y,z){

  }

  function rotateX(point, sign){
    var xMatrix = [[1, 0, 0],
                   [0, Math.cos(delta * sign), - Math.sin(delta*sign)],
                   [0, Math.sin(delta *sign), Math.cos(delta*sign)] ];

    applyRotationMatrix(point, xMatrix);
  }

  function rotateY(point, sign){
    var xMatrix = [[Math.cos(delta * sign), 0,Math.sin(delta *sign)],
                   [0, 1, 0],
                   [-Math.sin(delta *sign),0, Math.cos(delta*sign)] ];

    applyRotationMatrix(point, xMatrix);
  }

  function rotateZ(point, sign){
    var xMatrix = [[ Math.cos(delta * sign), - Math.sin(delta*sign), 0],
                   [Math.sin(delta*sign), Math.cos(delta * sign), 0],
                   [0, 0, 1] ];

    applyRotationMatrix(point, xMatrix);
  }

  function applyRotationMatrix(point, matrix){
    var staticPoint = angular.copy(point);

    for (var i = 0; i < 3; i++) {
      var sum = (matrix[i][0] * staticPoint.x) + (matrix[i][1] * staticPoint.y) + (matrix[i][2] * staticPoint.z);

      point[i] = sum;
    }
  }

  function animate() {
      requestAnimFrame(animate);
  }
  animate();
});
