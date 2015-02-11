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

    $scope.light = new THREE.PointLight(0xffffff);

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

    $scope.light.position.x = 10;
    $scope.light.position.y = 50;
    $scope.light.position.z = 130;

    $scope.renderer.setSize($scope.width, $scope.height);
    // attach renderer
    container.appendChild($scope.renderer.domElement);

    $scope.newSphere = function(){
      var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        50,
        20,
        20),
      $scope.material);

      sphere.geometry.dynamic = true;
      // changes to the vertices
      sphere.geometry.verticesNeedUpdate = true;
      // changes to the normals
      sphere.geometry.normalsNeedUpdate = true;

      $scope.shapes.push(sphere);
      return sphere;
    }


    $scope.animate = function() {
        requestAnimFrame($scope.animate);
        $scope.renderer.render($scope.scene, $scope.camera);
    }

    $scope.addSphere = function(){
      $scope.scene.add($scope.newSphere());
    }

    $scope.addSphere();

    $scope.animate();
});
