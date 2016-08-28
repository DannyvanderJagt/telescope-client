'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _node = require('rethinkdb-websocket-client/dist/node');

var _node2 = _interopRequireDefault(_node);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Todo:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 - [ ] Reconnect auto
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var r = _node2.default.rethinkdb;

var Client = (function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client(key) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this));

    _this.connection = undefined;
    _this.options = {
      key: key || options.key || '',
      host: options.host || 'localhost',
      port: options.port || 8000,
      secure: false,
      db: options.db || undefined,
      path: '/?' + key
    };

    _this.connect();
    return _this;
  }

  _createClass(Client, [{
    key: 'connect',
    value: function connect() {
      // Connect.
      _node2.default.connect(this.options).then(this.connectionDidConnect.bind(this)).catch(this.connectionDidError.bind(this));
    }
  }, {
    key: 'connectionDidConnect',
    value: function connectionDidConnect(connection) {
      this.connection = connection;
      console.log('connect');
      this.emit('connect');
    }
  }, {
    key: 'connectionDidError',
    value: function connectionDidError(error) {
      // console.log(error);
      this.emit('error', error);
    }
  }, {
    key: 'Store',
    value: function Store(query) {
      return new _store2.default(this, query);
    }
  }]);

  return Client;
})(_events2.default);

;

exports.default = Client;

// Client example.

var cl = new Client('safdhoiyaos76dfsd8fo6as9df6s', {
  db: 'telescope'
});

cl.on('connect', function () {
  // var query = r.table('notifications');

  var store = cl.Store(r.table('notifications'));

  store.on('add', function (row) {
    console.log('add', row);
  });

  store.on('delete', function (row) {
    console.log('delete', row);
  });

  store.on('update', function (row) {
    console.log('update', row);
  });
  store.on('init', function (row) {
    console.log('init', row);
  });
  // store.on('error', (row) => {
  //   console.log('error', row);
  // })

  // query.run(cl.connection, function(err, cursor) {
  //   cursor.toArray(function(err, results) {
  //     console.log(results);
  //   });
  // });
});