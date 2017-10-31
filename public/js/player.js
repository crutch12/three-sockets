 function MoveTowards(current, target, maxDelta) {
	 if (Math.abs(target - current) <= maxDelta)
	 {
	     return target;
	 }
	 return current + Math.sign(target - current) * maxDelta;
 }

 function Lerp(start, end, amt){
  return (1-amt)*start+amt*end
}

class Player {
	constructor(player, isMine) {
		// console.log(legs)
		this.player = player;
		this.isMine = isMine
		this.isMoving = false
		this.targetRotation = 0
		// this.shoots = []

		// var cubeGeometry = new THREE.CubeGeometry(1,1,1)
		// var cubeMaterial = new THREE.MeshBasicMaterial(
		// 	{color: new THREE.Color(`rgb(${player.color.r}, ${player.color.g}, ${player.color.b})`)})
		// var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		// cube.position.set(player.position.x, 1, player.position.z)
		// scene.add(cube)

		var mesh = legs.clone()
		mesh = mesh

		mesh.position.set(player.position.x, 0, player.position.z)
		scene.add(mesh)

		this.mesh = mesh

		this.mixer = new THREE.AnimationMixer( this.mesh );
		this.moving = {
			x: 0,
			z: 0
		}

		if (this.isMine) {
			console.log('mine', player.id)
			window.addEventListener("keydown", event => {
			  var moving = _.clone(this.moving)
			  switch (event.keyCode) {
			    case 68: //d
			      moving.x = 1;
			      break;
			    case 83: //s
			      moving.z = -1;
			      break;
			    case 65: //a
			      moving.x = -1;
			      break;
			    case 87: //w
			      moving.z = 1;
			      break;
			    case 32: //w
			      this.shoot()
			      break;
			  }
			  if (moving.x != this.moving.x || moving.z != this.moving.z) {
			  	this.moving = moving
			  	this.move()
			  }
			}, false);

			window.addEventListener("keyup", event => {
			  switch (event.keyCode) {
			    case 68: //d
			      this.moving.x = 0;
			      break;
			    case 83: //s
			      this.moving.z = 0;
			      break;
			    case 65: //a
			      this.moving.x = 0;
			      break;
			    case 87: //w
			      this.moving.z = 0;
			      break;
			  }
			  this.move()
			}, false);
		}

		socket.on('playerMove', (player) => {
			if (this.player.id == player.id) {
				// console.log(player.position)
				// this.mesh.position.set(player.position.x, 0, player.position.z)
				// this.moving = moving
				this.player.position = player.position
			}
		})

		socket.on('shoot', (shoot) => {
			var cubeGeometry = new THREE.CubeGeometry(0.3,0.3,0.3)
			var cubeMaterial = new THREE.MeshBasicMaterial(
				{color: new THREE.Color(`rgb(${this.player.color.r}, ${this.player.color.g}, ${this.player.color.b})`)})
			var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
			cube.shoot = shoot
			cube.position.set(shoot.position.x, 0, shoot.position.z)
			// cube.position.set(player.position.x, 1, player.position.z)
			scene.add(cube)
			shoots.push(cube)
			console.log(shoots)
		})


	}

	move() {

		// var length = Math.sqrt(this.moving.x*this.moving.x+this.moving.z*this.moving.z); //calculating length
		// if (length) {
		// 	this.moving.x = this.moving.x/length; //assigning new value to x (dividing x by lenght of the vector)
		// 	this.moving.z = this.moving.z/length; //assigning new value to y
		// }

		// console.log(this.moving)
		socket.emit('move', this.moving)
	}

	shoot() {
		socket.emit('shoot', this.mesh.rotation.y)
	}

	update(delta) {
		// this.mesh.position.x = MoveTowards(this.mesh.position.x, this.player.position.x, delta)
		// this.mesh.position.z = MoveTowards(this.mesh.position.z, this.player.position.z, delta)




		var diffVec = new THREE.Vector3().subVectors(this.mesh.position, new THREE.Vector3(this.player.position.x, 0, this.player.position.z))
		if (diffVec.length() > 5) {
			this.mesh.position.set(this.player.position.x, 0, this.player.position.z)
		} else {
			this.mesh.position.lerp( new THREE.Vector3(this.player.position.x, 0, this.player.position.z), delta * 10)
			
			var quaternion = new THREE.Quaternion();
			quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), this.targetRotation);
			
			this.mesh.quaternion.slerp(quaternion, delta * 10)
			// this.mesh.rotation.y = MoveTowards(this.mesh.rotation.y, this.targetRotation, delta * 10)
		}

		if (this.mixer) this.mixer.update(delta)

		if (diffVec.length() > 0.05) {
			if (!this.isMoving) {
				this.isMoving = true
				this.mixer.clipAction( this.mesh.geometry.animations[ 0 ] ).play();
			}

			this.targetRotation = Math.atan2(diffVec.x, diffVec.z)
			// this.mesh.rotation.y = 
		} else {
			if (this.isMoving) {
				this.isMoving = false
				this.mixer.clipAction( this.mesh.geometry.animations[ 0 ] ).stop();
			}
		}
	}

	leave() {
		scene.remove(this.cube)
	}
}