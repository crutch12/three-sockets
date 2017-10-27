'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var update = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(secs, cb) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!true) {
              _context.next = 6;
              break;
            }

            _context.next = 3;
            return later(secs);

          case 3:
            cb();
            // if (cb() == false) {
            //   break
            // }
            _context.next = 0;
            break;

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function update(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// update(0.5, function() {
//   console.log('0.5')
// })

// var getPlayers = () => _.filter(io.sockets.sockets, 'player')

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _pug = require('pug');

var _pug2 = _interopRequireDefault(_pug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingTimeout: 5000,
  pingInterval: 3000
});
http.listen(process.env.PORT || 3000);

app.set('json spaces', 2);

app.set('view engine', 'pug');
app.engine('html', _pug2.default.renderFile);

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function setHeaders(res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
};

app.use(_express2.default.static('public', options));

app.get('/', function (req, res) {
  res.render('game');
});

// app.listen(process.env.PORT || 3000, async function () {
// 	console.log(`App is listening on port ${process.env.PORT || 3000}!`)
// })

// var sockets = []
var id = 0;
var players = [];
var delta = 0.015;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function later(delay) {
  return new _promise2.default(function (resolve) {
    setTimeout(resolve, delay * 1000);
  });
}

io.on('connection', function (socket) {

  var lastSentPosition = {};

  // console.log('a user connected')

  // console.log(players)
  socket.emit('players', players);

  socket.player = {
    id: ++id,
    position: {
      x: getRandomArbitrary(-10, 10),
      z: getRandomArbitrary(-10, 10)
    },
    color: {
      r: getRandomInt(50, 200),
      g: getRandomInt(50, 200),
      b: getRandomInt(50, 200)
    }
  };

  players.push(socket.player);

  socket.emit('me', socket.player);

  socket.broadcast.emit('playerJoined', socket.player);

  // var ready = false;
  // socket.on('ready', function(cb) {

  //   cb(socket.player)
  // })

  // socket.on('players', function(cb) {
  //   cb(_.filter(io.sockets.sockets, 'player'))
  //   // cb(getPlayers())
  // })

  // socket.emit('players', getPlayers())

  // console.log(socket.player.id, 'is ready!')
  // console.log(_.map(io.sockets.sockets, 'player'))
  // console.log(_.map(_.filter(io.sockets.sockets, 'player'), 'player.id'))
  // sockets.push(socket)

  // socket.emit('players', players)

  // socket.on('disconnect', function() {
  //   // _.remove(players, pl => pl.id == player.id)
  //   console.log(socket.player.id, 'disconnected')
  // })

  socket.on('move', function (moving) {
    // socket.broadcast.emit('playerMove', socket.player, moving)
    socket.moving = moving;
  });

  socket.on('disconnect', function () {
    _lodash2.default.remove(players, { id: socket.player.id });
    console.log('new players', players);
    socket.broadcast.emit('playerLeft', socket.player.id);
  });

  update(delta, function () {
    if (socket.moving && (socket.moving.x != 0 || socket.moving.z != 0)) {

      var moving = _lodash2.default.clone(socket.moving);
      var length = Math.sqrt(moving.x * moving.x + moving.z * moving.z); //calculating length
      if (length) {
        moving.x = moving.x / length; //assigning new value to x (dividing x by lenght of the vector)
        moving.z = moving.z / length; //assigning new value to y
      }

      socket.player.position.x += moving.x * delta * 10;
      socket.player.position.z -= moving.z * delta * 10;
      // console.log(socket.player.position)
    }
  });

  update(0.1, function () {
    if (lastSentPosition.x != socket.player.position.x || lastSentPosition.z != socket.player.position.z) {
      lastSentPosition = _lodash2.default.clone(socket.player.position);
      io.emit('playerMove', socket.player);
    }
  });

  //   socket.on('chat message', function(msg) {
  //     socket.broadcast.emit('chat message', msg)
  //   })
});