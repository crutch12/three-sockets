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
		this.player = player;
		this.isMine = isMine
		
		var cubeGeometry = new THREE.CubeGeometry(1,1,1)
		var cubeMaterial = new THREE.MeshBasicMaterial(
			{color: new THREE.Color(`rgb(${player.color.r}, ${player.color.g}, ${player.color.b})`)})
		var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
		cube.position.set(player.position.x, 1, player.position.z)
		scene.add(cube)

		this.cube = cube

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
				// this.cube.position.set(player.position.x, 0, player.position.z)
				// this.moving = moving
				this.player.position = player.position
			}
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

	update(delta) {
		this.cube.position.x = Lerp(this.cube.position.x, this.player.position.x, delta)
		this.cube.position.z = Lerp(this.cube.position.z, this.player.position.z, delta)
		// console.log(this.moving.x)
		// this.cube.position.x -= this.moving.x * delta
		// this.cube.position.z += this.moving.z * delta
	}

	leave() {
		scene.remove(this.cube)
	}
}