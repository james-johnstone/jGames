angular.module('app').controller('webglController', function($scope,appNotifier){

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
    $scope.rotation = 0.5;

    var mouse3D, isMouseDown = false, onMouseDownPosition,
			radious = 800, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    // make the default material and light
    $scope.material = new THREE.MeshLambertMaterial(
          {
            color: 0xCC0000
          });

    //add some directional light
    $scope.light = new THREE.DirectionalLight( 0xffffff, 1 );
    $scope.light.position.set(0, 0, 1);

    $scope.light2 = new THREE.DirectionalLight( 0xffffff, 1 );
    $scope.light2.position.set(0, 0, 1);

    var ambientLight = new THREE.AmbientLight( 0xffffff );

    $scope.renderer = new THREE.WebGLRenderer();
    $scope.camera =  new THREE.PerspectiveCamera(
                  $scope.VIEW_ANGLE,
                  $scope.ASPECT,
                  $scope.NEARNEAR,
                  $scope.FARFAR);

    $scope.scene = new THREE.Scene();
    $scope.scene.add($scope.camera);
    $scope.scene.add($scope.light);
    $scope.scene.add( ambientLight );

		onMouseDownPosition = new THREE.Vector2();

    // set defaults
		$scope.camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
		$scope.camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
		$scope.camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );

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
      var colour = new THREE.Color();
      colour.setHex('0xCC0000');

      var shape = new THREE.Mesh(geometry,
          new THREE.MeshLambertMaterial({wireframe : true}));

      shape.material.color = colour;
      shape.material.ambient = colour;

      shape.geometry.dynamic = true;
      // changes to the vertices
      shape.geometry.verticesNeedUpdate = true;
      // changes to the normals
      shape.geometry.normalsNeedUpdate = true;

      $scope.shapes.push(shape);
      $scope.activeShape = shape;
      return shape;
    }

    $scope.addSphere = function(){
      $scope.scene.add($scope.newSphere());
    }

    $scope.addBox = function(){
      $scope.scene.add($scope.newBox());
    }

    $scope.getSerializableShape = function(shape){
      var serialized = {};

      serialized.position = shape.position;
      serialized.scale = shape.scale;
      serialized.rotation = shape.rotation;

      serialized.colour = shape.material.color;
      serialized.isWireframe = shape.material.wireframe
      serialized.geometry = shape.geometry.type;
      return serialized
    }

    $scope.getJson = function(){
      var shapes = [];

      for (var i =0; i < $scope.shapes.length; i++){
        shapes.push($scope.getSerializableShape($scope.shapes[i]));
      }
      return angular.toJson(shapes);
    }

    $scope.saveState = function(){
        docCookies.setItem('scene', $scope.getJson());
        appNotifier.notify('State saved', true);
    }

    $scope.clearScene = function(){
      for (var i= 0; i < $scope.shapes.length; i++){
        $scope.scene.remove($scope.shapes[i]);
      }
      $scope.shapes = [];
      appNotifier.notify('Cleared', true);
    }

    $scope.deserializeShape = function(shape){
      var newShape = shape.geometry == "BoxGeometry" ? $scope.newBox() : $scope.newSphere();

      newShape.position.set(shape.position.x,shape.position.y,shape.position.z);
      newShape.scale.set(shape.scale.x,shape.scale.y,shape.scale.z);
      newShape.rotation.set(shape.rotation._x,shape.rotation._y,shape.rotation._z);
      newShape.material.color.setRGB(shape.colour.r,shape.colour.g,shape.colour.b);

      return newShape;
    }

    if (docCookies.hasItem('scene')){
      var scene = docCookies.getItem('scene');
      var shapes = angular.fromJson(scene);

      for (var i=0; i <shapes.length; i++){
        var shape = $scope.deserializeShape(shapes[i]);
        $scope.scene.add(shape);
      }
    }
    else {
      $scope.addSphere();
      $scope.activeShape = $scope.shapes[0];
    }

    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'mousedown', onDocumentMouseDown, false );
		container.addEventListener( 'mouseup', onDocumentMouseUp, false );
		container.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

    $scope.animate = function() {
        requestAnimFrame($scope.animate);
        $scope.camera.lookAt($scope.scene.position);
        $scope.renderer.render($scope.scene, $scope.camera);
    }

    $scope.animate();

    function onDocumentMouseWheel( event ) {
				radious -= event.wheelDeltaY;

				$scope.camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
				$scope.camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
				$scope.camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
				$scope.camera.updateMatrix();
			}

			function onDocumentMouseDown( event ) {
				isMouseDown = true;

				onMouseDownTheta = theta;
				onMouseDownPhi = phi;
				onMouseDownPosition.x = event.clientX;
				onMouseDownPosition.y = event.clientY;
			}

      function onDocumentMouseUp( event ) {
				isMouseDown = false;

				onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
				onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
      }

    	function onDocumentMouseMove( event ) {
  			if ( isMouseDown ) {
  				theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
  				phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

  				phi = Math.min( 180, Math.max( 0, phi ) );

  				$scope.camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
  				$scope.camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
  				$scope.camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
  				$scope.camera.updateMatrix();

  			}
		}

});
