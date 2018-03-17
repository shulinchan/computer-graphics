
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/



	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam;  // we have two cameras in the main scene
	var avatar;
	// here are some mesh objects ...

	var cone;

	var removedBalls;
	var removedFakeBalls;
	var totalBalls;

	var endScene, endCamera, endText;


	var controls = {fwd:false, bwd:false, left:false, right:false,
		speed:10, fly:false, reset:false, randomPlace:false,
		camera:camera}

	var gameState = {score:0, health:10, scene:'main', camera:'none' }


	// Here is the main game control
    init(); //
    initControls();
	animate();  // start the animation loop!

	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}

	var startScene, startText, startCamera;
	function createStartScene(){
		startScene = initScene();
		startText = createSkyBox('startscreen.png',8);
		startScene.add(startText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		startScene.add(light1);
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);
		gameState.scene = 'startscreen';
	}

	var loseScene, loseText, loseCamera;
	function createLoseScene(){
		loseScene = initScene();
		loseText = createSkyBox('losescreen.png',8);
		loseScene.add(loseText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		loseScene.add(light1);
		loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		loseCamera.position.set(0,50,1);
		loseCamera.lookAt(0,0,0);
	}

/**
  To initialize the scene, we initialize each of its components
  */
  function init(){
  	initPhysijs();
  	scene = initScene();
  	createEndScene();
  	initRenderer();
  	createMainScene();
  	createLoseScene();
  	createStartScene();
  }

  function createMainScene(){
    // setup lighting
    var light1 = createPointLight();
    light1.position.set(0,200,20);
    scene.add(light1);
    var light0 = new THREE.AmbientLight( 0xffffff,0.25);
    scene.add(light0);

		// create main camera
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,50,0);
		camera.lookAt(0,0,0);

		// create the ground and the skybox
		var ground = createGround('grass.png');
		scene.add(ground);
		var skybox = createSkyBox('sky.jpg',1);
		scene.add(skybox);

		// create the avatar
		avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
		createAvatar();
		avatarCam.translateY(-4);
		avatarCam.translateZ(3);
		gameState.camera = avatarCam;

		//add balls, everything scales on "totalBalls"
		totalBalls = 3;
		magicBalls = 1;
		removedBalls = 0;
		removedFakeBalls = 0;
		removedMagicBalls = 0;
		addBalls(totalBalls);
		addFakeBalls(totalBalls * 3);
		addMagicBalls(magicBalls);
		
		var position, position2, position3;

		position = Math.floor((Math.random() * 10) + 1);
		console.log(position);
		if(position%2==0){
			position=10;
			position2=15;
			position3=20;
		} else if(position%3==0){
			position=15;
			position2=20;
			position3=10;
		}

		else{
			position=20;
			position2=10;
			position3=15;
		}


		addVictoryBalls(1,position);
		addDefeatBalls(1,position2);
		addDefeatBalls(1,position3);
		

		addObstacles();

		cone = createConeMesh(4,6);
		cone.position.set(10,3,7);
		scene.add(cone);

		npc = createBoxMesh2(0x0000ff, 1, 2, 4);
		npc.position.set(-15, 3, 7);
		npc.addEventListener('collision',function(other_object){
			if (other_object == avatar){
				soundEffect('evil.wav');
				gameState.health--;
				controls.randomPlace = true;
			}

			if(gameState.health == 0){
				gameState.scene = 'lose';
			}
		})

		scene.add(npc);
	}



	function randN(n){
		return Math.random()*n;
	}

	function getRandomArbitrary(min, max) {
 		return Math.random() * (max - min) + min;
	}

	function distanceVector( v1, v2 ){
		var dx = v1.position.x - v2.position.x;
		var dy = v1.position.y - v2.position.y;
		var dz = v1.position.z - v2.position.z;

		return Math.sqrt( dx * dx + dy * dy + dz * dz );
	}

	function addBalls(numBalls) {
		for (i=0; i<numBalls; i++) {
			var ball = createBall(0xffff00);
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object == cone) {
						console.log("Regular ball " + i + " hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						removedBalls += 1;

					if (gameState.score == totalBalls) {
						gameState.scene = 'youwon';
					}
					// make the ball drop below the scene ..
					// threejs doesn't let us remove it from the schene...
					this.position.y = this.position.y - 100;
					this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addFakeBalls(numBalls) {
		for(i=0; i<numBalls; i++) {
			var ball = createBall(0xffff7d);
			ball.position.set(randN(35)+15,30,randN(35)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("Fake ball "+i+" hit the cone");
						gameState.health -= 1;
						removedFakeBalls+=1;

						if(gameState.health == 0){
							gameState.scene = 'lose';
						}

						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addMagicBalls(numBalls) {
		for(i=0; i<numBalls; i++) {
			var ball = createBall(0xffb6c1);
			ball.position.set(randN(35)+15,30,randN(35)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("Magic ball "+i+" hit the cone");
						gameState.health += 5;
						removedMagicBalls+=1;

						if(gameState.health > totalBalls){
							gameState.scene = 'youwon';
						}

						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addVictoryBalls(numBalls, position) {
		for(i=0; i<numBalls; i++) {
			var ball = createGBall(0xff0000);
			ball.position.x = position;
			ball.position.z = -20;

			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("Gamble WON!");
						gameState.health += 5;
						removedMagicBalls+=1;

						if(gameState.health > totalBalls){
							gameState.scene = 'youwon';
						}

						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addDefeatBalls(numBalls, position2) {
		for(i=0; i<numBalls; i++) {
			var ball = createGBall(0x007FFF);
			ball.position.x = position2;
			ball.position.z = -20;
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("Gamble FAIL!");
						gameState.health = 0;
						removedMagicBalls+=1;

						if(gameState.health == 0){
							gameState.scene = 'lose';
						}

						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addObstacles() {
        for(i=0; i<2; i++) {
	        var obstacle1 = createWall(0x000000, 10, 3, 1);
	       	var obstacle2 = createWall(0x696969, 10, 3, 1);

	        obstacle1.position.set(getRandomArbitrary(5,40) * 0.9,1,getRandomArbitrary(5,40) * 0.8);
	        obstacle2.position.set(getRandomArbitrary(15,30) * 0.9,1,getRandomArbitrary(15,35) * 0.8);

	        obstacle2.rotation.set(0, 90, 180);

	        scene.add(obstacle1);
	        scene.add(obstacle2);
        }
    }

	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		//scene = new THREE.Scene();
		var scene = new Physijs.Scene();
		return scene;
	}

	function initPhysijs(){
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}
	/*
	The renderer needs a size and the actual canvas we draw on
	needs to be added to the body of the webpage. We also specify
	that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;

		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}

	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    	//mesh = new Physijs.BoxMesh( geometry, material,0 );
    	mesh.castShadow = true;
    	return mesh;
  	}

	function createBoxMesh2(color,w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createWall(color,w,h,d){
    	var geometry = new THREE.BoxGeometry( w, h, d);
    	var material = new THREE.MeshLambertMaterial( { color: color} );
    	mesh = new Physijs.BoxMesh( geometry, material, 0 );
    	//mesh = new Physijs.BoxMesh( geometry, material,0 );
    	mesh.castShadow = true;
    	return mesh;
  }



  function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}



	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}

	function createAvatar(){
		var loader = new THREE.JSONLoader();
		loader.load("../models/suzanne.json",
			function ( geometry, materials ) {
				console.log("loading suzanne");
				var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
				var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
				var suzanne = new Physijs.BoxMesh( geometry, pmaterial );
				console.log(JSON.stringify(suzanne.scale));// = new THREE.Vector3(4.0,1.0,1.0);
				suzanne.position.x = 10;
				suzanne.position.y = 5;
				suzanne.position.z = -10;
				suzanne.castShadow = true;
				avatarCam.position.set(0,10,0);
				avatarCam.lookAt(0,4,10);
				suzanne.add(avatarCam);
				scene.add(suzanne);
				avatar = suzanne;
			},
			function(xhr){
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			function(err){
				console.log("error in loading: "+err);
			}
		)
	}


	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createGBall(bColor){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var texture = new THREE.TextureLoader().load( '../images/gamble.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 3, 3 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(bColor){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: bColor} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
		  clock = new THREE.Clock();
		  clock.start();

		  window.addEventListener( 'keydown', keydown);
		  window.addEventListener( 'keyup',   keyup );
		}


	function keydown(event){
		console.log("Keydown:"+event.key);
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			addBalls(removedBalls);
			addFakeBalls(removedFakeBalls);
			addMagicBalls(removedMagicBalls);
			addObstacles();
			removedBalls = 0;
			removedFakeBalls = 0;
			removedMagicBalls = 0;
			return;
		}

		if (gameState.scene == 'lose' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			addBalls(removedBalls);
			addFakeBalls(removedFakeBalls);
			addMagicBalls(removedMagicBalls);
			addObstacles();
			removedBalls = 0;
			removedFakeBalls = 0;
			return;
		}

		if (gameState.scene == 'startscreen' && event.key=='p') {
			gameState.scene = 'main';
			gameState.score = 0;
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": controls.up = true; break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
			case " ": controls.fly = true; break;
			case "h": controls.reset = true; break;

			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1); break;
			case "ArrowRight": avatarCam.translateY(-1); break;
			case "ArrowUp": avatarCam.translateZ(-1); break;
			case "ArrowDown": avatarCam.translateZ(1); break;
			case "q": avatarCam.rotation.y += Math.PI / 2; break;
			case "e": avatarCam.rotation.y -= Math.PI / 2; break;

		}

	}

	function keyup(event){
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key){
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
			case " ": controls.fly = false; break;
			case "h": controls.reset = false; break;
		}
	}

	function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

		if (controls.fly){
			avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
		}

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.reset){
			avatar.__dirtyPosition = true;
			avatar.position.set(40,10,40);
		}

		if (controls.randomPlace){
			avatar.__dirtyPosition = true;
			avatar.position.set(getRandomArbitrary(-5,50),1,getRandomArbitrary(-5,50));
			controls.randomPlace = false;
		}

	}

	function updateNPC(){
		npc.lookAt(avatar.position);
	  // npc.__dirtyPosition = true;
		if (distanceVector(avatar, npc) < 20){
			npc.material.color.setHex( 0xf44336 );
			soundEffect('angry.wav');
			npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(4));
		} else {
			npc.material.color.setHex( 0x0000ff );
		}

		// npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(2));
	}


	function animate() {




		requestAnimationFrame( animate );



		switch(gameState.scene) {

			case "startscreen":
			startText.rotateY(0.005);
			renderer.render( startScene, startCamera );
			break;

			case "lose":
			loseText.rotateY(0.005);
			renderer.render( loseScene, loseCamera );
			break;

			case "youwon":
			endText.rotateY(0.005);
			renderer.render( endScene, endCamera );
			break;

			case "main":
			updateAvatar();
			updateNPC();
			scene.simulate();
			if (gameState.camera!= 'none'){
				renderer.render( scene, gameState.camera );
			}
			break;

			default:
			console.log("don't know the scene "+gameState.scene);

		}




		//draw heads up display ..
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
		+ gameState.score
    	+ ' health: ' + gameState.health
		+ '</div>';
	}



