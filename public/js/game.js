var clock = new THREE.Clock()

var renderer = new THREE.WebGLRenderer()
renderer.setClearColor(0xAAA888)
renderer.setSize(window.innerWidth, window.innerHeight)

var loader = new THREE.JSONLoader();
var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

camera.position.set(25, 25, 25)
camera.lookAt(new THREE.Vector3(0, 0, 0))

var axes = new THREE.AxesHelper( 20 );
axes.position.y = 1
scene.add(axes);

// var planeGeometry = new THREE.PlaneGeometry(80, 80);
// var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
// var plane = new THREE.Mesh(planeGeometry,planeMaterial);
// plane.rotation.x=-0.5*Math.PI;
// scene.add(plane);

var cubePlaneGeometry = new THREE.CubeGeometry(80, 1, 80)
var cubePlaneMaterial = new THREE.MeshLambertMaterial({color: 0xBBBBBB});
var cubePlane = new THREE.Mesh(cubePlaneGeometry, cubePlaneMaterial);
cubePlane.position.y = -2
scene.add(cubePlane)

var controls = new THREE.OrbitControls( camera, renderer.domElement );

var light = new THREE.HemisphereLight( 0xffffff, 0x003300, 1 );
light.position.set(0, 5, 0 );
scene.add( light );
// var spotLight = new THREE.SpotLight( 0xffffff );
// spotLight.position.set( 15, 35, 15 );
// scene.add(spotLight );

document.body.appendChild(renderer.domElement)

var legs;
var mixer;
loader.load( './models/simple.js', function ( geometry, materials ) {
	for (var k in materials) {
		materials[k].skinning = true;
	}
	legs = new THREE.SkinnedMesh( geometry, materials );
	legs.scale.set( 0.25, 0.25, 0.25 );
	// scene.add( legs );
	// mixer = new THREE.AnimationMixer( legs );
	// mixer.clipAction( legs.geometry.animations[ 0 ] ).play();
} );


// var cubeGeometry = new THREE.CubeGeometry(1,1,1)
// var cubeMaterial = new THREE.MeshLambertMaterial(
// 	{color: 0xffffff})
// var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
// cube.position.set(0, 0, 0)
// scene.add(cube)

var players = [];
var player = null;
var shoots = []
// var socket = io(`${location.origin}:3000`);
var socket = io();

// socket.emit('players', function(_players) {
//   players = _players

//   for (var pl of players) {
//   	var netPl = new Player(pl)
//   	netPl.isMine = false
//   }

//   socket.emit('ready', function(_player) {
// 		player = new Player(_player)
// 		player.isMine = true
// 		console.log(_player)
// 		players.push(player)
// 		console.log(_.map(players, 'player'))
// 	})
// });

socket.on('players', function(_players){
  for (var pl of _players) {
  	var netPl = new Player(pl, false)
  	players.push(netPl)
  }
  console.log(players)
})

socket.on('me', function(_player) {
	console.log('me', _player)
	player = new Player(_player, true)
	players.push(player)
	console.log(_.map(players, 'player'))
})

socket.on('playerJoined', function(_player) {
	console.log(player, 'joined')
	var netPl = new Player(_player, false)
	players.push(netPl)
	console.log(_.map(players, 'player'))
})

socket.on('playerLeft', function(playerId) {
	console.log(playerId, 'left')
	var left = _.find(players, {player: {id: playerId}})
	left.leave()
	_.remove(players, {player: {id: playerId}})
})

socket.on('shootsMove', (shootsI) => {
	for (var shoot of shootsI) {
		var sh = _.find(shoots, {shoot: {id: shoot.id}})
		sh.position.set(shoot.position.x, 0, shoot.position.z)
	}
})

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
} 

function render() {
	requestAnimationFrame(render)
	// if (mixer) mixer.update(0.015)

	renderer.render(scene, camera)
	for (var pl of players) {
		pl.update(0.015)
	}
} 

render()