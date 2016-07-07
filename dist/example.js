'use strict';

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var Telescope = require('./node');
// import NC from './nc';
// import Projects from './projects';

// Connect...
_node2.default.connect('sdfa8s');

_node2.default.on('connect', function () {
  console.log('connected');
  // Initialize service.
  // Telescope.service({
  //   name: 'nc',
  // });

  // let notifications = Telescope.db('telescope').table('notifications');

  // let query = notifications.query()
  //   .store(
  //     {hello: 'bye'},
  //     success => console.log('stored'),
  //     error => console.log('could not store, ', error)
  //   )

  // Telescope.notification({
  //   title: 'Hello',
  //   description: 'test'
  // }).send();
});