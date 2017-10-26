var clock = new THREE.Clock()

var renderer = new THREE.WebGLRenderer()
renderer.setClearColor(0xAAA888)
renderer.setSize(window.innerWidth, window.innerHeight)

var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

camera.position.set(25, 25, 25)
camera.lookAt(new THREE.Vector3(0, 0, 0))

var axes = new THREE.AxisHelper( 20 );
scene.add(axes);

var planeGeometry = new THREE.PlaneGeometry(40, 40);
var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
var plane = new THREE.Mesh(planeGeometry,planeMaterial);
plane.rotation.x=-0.5*Math.PI;
scene.add(plane);



document.body.appendChild(renderer.domElement)

// var cubeGeometry = new THREE.CubeGeometry(1,1,1)
// var cubeMaterial = new THREE.MeshLambertMaterial(
// 	{color: 0xffffff})
// var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
// cube.position.set(0, 0, 0)
// scene.add(cube)

var players = [];
var player = null;

var socket = io("http://localhost:8080");

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


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
} 

function render() {
	requestAnimationFrame(render)
	renderer.render(scene, camera)
	for (var pl of players) {
		pl.update(0.015 * 10)
	}
} 

render()