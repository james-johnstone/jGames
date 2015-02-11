angular.module('app').controller('webglController', function($scope){

  $scope.height = window.innerHeight - 160;
  $scope.width = window.innerWidth /1.6;
  var container = document.getElementById("container");
    // set some camera attributes
    $scope.VIEW_ANGLE = 45,
    $scope.ASPECT = $scope.width / $scope.height,
    $scope.NEAR = 0.1,
    $scope.FAR = 10000;
    $scope.shapes = [];
    $scope.activeShape;

    // make the default material and light
    $scope.material = new THREE.MeshLambertMaterial(
          {
            color: 0xCC0000
          });

    //$scope.light = new THREE.PointLight(0xffffff);
    //$scope.light.position.x = 10;
    //$scope.light.position.y = 50;
    //$scope.light.position.z = 130;+

    //add some directional light
    $scope.light = new THREE.DirectionalLight( 0xffffff, 1 );
    $scope.light.position.set(0, 0, 1);

    //$scope.light = new THREE.AmbientLight(0xfffff);
    //set the scene

    $scope.renderer = new THREE.WebGLRenderer();
    $scope.camera =  new THREE.PerspectiveCamera(
                  $scope.VIEW_ANGLE,
                  $scope.ASPECT,
                  $scope.NEARNEAR,
                  $scope.FARFAR);

    $scope.scene = new THREE.Scene();
    $scope.scene.add($scope.camera);
    $scope.scene.add($scope.light);

    // set defaults
    $scope.camera.position.z = 300;

    $scope.renderer.setSize($scope.width, $scope.height);
    // attach renderer
    container.appendChild($scope.renderer.domElement);

    $scope.newSphere = function(){
      return $scope.newShape(new THREE.SphereGeometry(60,20,20));
    }

    $scope.newBox  = function(){
      return $scope.newShape( new THREE.BoxGeometry(20,20,20,4,4,4));
    }

    $scope.newShape = function(geometry){
      var shape = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial(
            {
              color: 0xCC0000,
              wireframe : true
            }));
      shape.geometry.dynamic = true;
      // changes to the vertices
      shape.geometry.verticesNeedUpdate = true;
      // changes to the normals
      shape.geometry.normalsNeedUpdate = true;

      $scope.shapes.push(shape);
      $scope.activeShape = shape;
      return shape;
    }


    $scope.animate = function() {
        requestAnimFrame($scope.animate);
        $scope.renderer.render($scope.scene, $scope.camera);
    }

    $scope.addSphere = function(){
      $scope.scene.add($scope.newSphere());
    }

    $scope.addBox = function(){
      $scope.scene.add($scope.newBox());
    }

    $scope.rotate = function(x,y){
      $scope.camera.position.x += Math.cos(1) * x;
      $scope.camera.position.y += Math.sin(1) * y;

      $scope.camera.lookAt($scope.scene.position);
    }

    $scope.addSphere();
    $scope.activeShape = $scope.shapes[0];

    $scope.animate();
});
