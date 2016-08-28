'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = (function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  function Store(client, query) {
    _classCallCheck(this, Store);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));

    _this.client = client;
    _this.query = query;

    _this.fetch();
    _this.listen();

    _this.data = [];

    // return this.data;
    return _this;
  }

  _createClass(Store, [{
    key: 'fetch',
    value: function fetch() {
      console.log('fetch');
      this.query.run(this.client.connection, this.onFetch.bind(this));
    }
  }, {
    key: 'onFetch',
    value: function onFetch(error, cursor) {
      var _this2 = this;

      if (error) {
        this.emit('error', error);return;
      }
      cursor.toArray(function (err, results) {
        if (err) {
          _this2.emit('error', error);return;
        }
        _this2.data = results;
        _this2.emit('init', results);
      });
    }
  }, {
    key: 'listen',
    value: function listen() {
      this.query.changes().run(this.client.connection, this.onChange.bind(this));
    }
  }, {
    key: 'onChange',
    value: function onChange(err, cursor) {
      var _this3 = this;

      cursor.each(function (error, item) {
        if (error) {
          _this3.emit('error', error);return;
        }

        if (item.new_val !== null && item.old_val === null) {
          _this3.emit('add', item.new_val);
        } else if (item.new_val !== null && item.old_val !== null) {
          _this3.emit('change', item.new_val, item.old_val);
        } else if (item.new_val === null && item.old_vall !== null) {
          _this3.emit('delete', item.old_vall);
        }
      });
    }
  }]);

  return Store;
})(_events2.default);

exports.default = Store;