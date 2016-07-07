'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

// Websocket polyfill for nodeJS.
var Ws = require('ws');
var WebSocket = Ws;

function Telescope() {
  this.host = 'localhost';
  this.port = 2001;

  this.key;
  this.ws;
  this.callbacks = {};
  this.events = {};

  this.warningIsEnabled = true;

  // Reconnect...
  this.attempToReconnect = false;
  this.reconnectTimeout;

  return this;
}

Telescope.prototype.warn = function (msg) {
  if (!this.warningIsEnabled) {
    return this;
  }
  console.log('Telescope - ' + msg);
  return this;
};

Telescope.prototype.on = function (event, cb) {
  if (typeof event !== 'string') {
    this.warn('The event for \'Telescope.on\' must be a string.');
    return this;
  }
  if (typeof cb !== 'function') {
    this.warn('The callback for \'Telescope.on\' must be a function.');
    return this;
  }

  if (!this.events[event]) {
    this.events[event] = [];
  }

  this.events[event].push(cb);
  return this;
};

Telescope.prototype.emitAndWarn = function (event, data) {
  this.warn(data);
  return this.emit(event, data);
};

Telescope.prototype.emit = function (event, data) {
  if (!this.events[event]) {
    return this;
  }

  var i = 0,
      length = this.events.length;
  for (i; i < length; i++) {
    this.events[i].apply(null, data);
  }
  return this;
};

Telescope.prototype.setOptions = function (opts) {
  if (!opts) {
    opts = {};
  }

  if (typeof opts == 'string') {
    opts = { key: opts };
  }

  if (!(typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) == 'object') {
    this.emitAndWarn('error', 'Options should be a string or an object');
    return this;
  }

  this.host = opts.host || this.host;
  this.port = opts.port || this.port;
  this.key = opts.key || this.key;
  this.warningIsEnabled = opts.warn !== undefined ? opts.warn : true;

  return this;
};

Telescope.prototype.connect = function (options) {
  this.setOptions(options);

  if (this.ws) {
    this.emitAndWarn('connection_error', 'Already connected');
    return this;
  }

  var url = ['ws://', this.host, ':', this.port, '/', this.key].join('');

  this.ws = new WebSocket(url);

  this.ws.onopen = this._connectionDidOpen.bind(this);
  this.ws.onclose = this._connectionDidClose.bind(this);
  this.ws.onerror = this._connectionDidError.bind(this);
  this.ws.onmessage = this._connectionDidSignal.bind(this);

  return this;
};

Telescope.prototype.disconnect = function () {
  if (!this.ws) {
    this.emitAndWarn('connection_error', 'Can not disconnect when there is no active connection.');
    return;
  }

  if (this.ws.cancelConnectionImpl) {
    this.ws.cancelConnectionImpl();
  }

  delete this.ws;
  return this;
};

Telescope.prototype._reconnect = function () {
  this.reconnectTimeout = setTimeout((function () {
    this.connect();
  }).bind(this), 1000);
  return this;
};

Telescope.prototype._connectionDidOpen = function () {
  this.emit('connect');
  return this;
};

Telescope.prototype._connectionDidClose = function () {
  if (!this.reconnectTimeout) {
    this.emit('disconnect');
  }

  delete this.ws;
  this.ws = undefined;
  this._reconnect();

  return this;
};

Telescope.prototype._connectionDidError = function (error) {
  this.emitAndWarn('connection_error', error.code);
  return this;
};

Telescope.prototype._connectionDidSignal = function (signal) {
  try {
    signal = JSON.parse(signal.data);
  } catch (error) {
    this.emitAndWarn('error', 'Could not parse incomming data.');
    return this;
  }

  var id = signal.id,
      event = signal.e,
      data = signal.d,
      close = signal.c;

  try {
    data = JSON.parse(data);
  } catch (error) {
    this.emitAndWarn('error', 'Could not parse data attribute without the incomming data packet.');
    return this;
  }

  if (this.callbacks[id] && this.callbacks[id][event]) {
    this.callbacks[id][event](data);
  }

  if (this.callbacks[id] && close) {
    delete this.callbacks[id];
  }

  return this;
};

Telescope.prototype._send = function (signal, callbacks) {
  if (!signal) {
    signal = {};
  }

  var id = Uid();
  signal.id = id;

  if (callbacks) {
    this.callbacks[id] = callbacks;
  }

  try {
    signal = JSON.stringify(signal);
  } catch (error) {
    this.emitAndWarn('error', 'Could not stringify the signal. Signal should be an object.');
    return this;
  }

  if (!this.ws) {
    this.emitAndWarn('error', 'Could not send data due to no live connection');
    return this;
  }

  this.ws.send(signal);
};

// Public api.
Telescope.prototype.db = function (name) {
  return new Database(this, name);
};

/*
  Database
 */

function Database(telescope, name) {
  this.telescope = telescope;
  this.name = name;

  return this;
}

Database.prototype.table = function (name) {
  if (typeof name !== 'string') {
    this.telescope.emitAndWarn('error', 'The name of a table must be a string.');
    return;
  }
  return new Table(this.telescope, this, name);
};

/*
  Table
 */
function Table(telescope, db, name) {
  this.telescope = telescope;
  this.db = db;
  this.name = name;

  return this;
}

Table.prototype.query = function () {
  if (typeof name !== 'string') {
    this.telescope.emitAndWarn('error', 'The name of a table must be a string.');
    return;
  }
  return new Query(this.telescope, this.db, this);
};

/*
  Query
 */
function Query(telescope, db, table) {
  this.telescope = telescope;
  this.db = db;
  this.table = table;

  this.query = {};
  this.rows = [];

  return this;
}

Query.prototype.limit = function (limit) {
  if (!limit) {
    limit = 10;
  }
  if (typeof limit !== 'number') {
    this.telescope.emitAndWarn('error', 'The argument for query.limit should be a number.');
    return this;
  }
  this.query.limit = limit;
  return this;
};

Query.prototype.skip = function (skip) {
  if (!skip) {
    skip = 0;
  }
  if (typeof skip !== 'number') {
    this.telescope.emitAndWarn('error', 'The argument for query.skip should be a number.');
    return this;
  }
  this.query.skip = skip;
  return this;
};

Query.prototype.nth = function (nth) {
  if (!nth) {
    nth = 0;
  }
  if (typeof nth !== 'number') {
    this.telescope.emitAndWarn('error', 'The argument for query.nth should be a number.');
    return this;
  }
  this.query.nth = nth;
  return this;
};

Query.prototype.id = function (id) {
  if (!id) {
    return this;
  }
  if (typeof id !== 'string' || typeof id !== 'number') {
    this.telescope.emitAndWarn('error', 'The argument for query.id should be a string or a number.');
    return this;
  }
  this.query.id = id;
  return this;
};

Query.prototype.filter = function (filter) {
  if (!filter) {
    filter = {};
  }
  if ((typeof filter === 'undefined' ? 'undefined' : _typeof(filter)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The argument for query.filter should be an object.');
    return this;
  }
  this.query.filter = filter;
  return this;
};

Query.prototype.lt = function (lt) {
  if (!lt) {
    lt = {};
  }
  if ((typeof lt === 'undefined' ? 'undefined' : _typeof(lt)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The argument for query.lt should be an object.');
    return this;
  }
  this.query.lt = lt;
  return this;
};

Query.prototype.gt = function (gt) {
  if (!gt) {
    gt = 10;
  }
  if ((typeof gt === 'undefined' ? 'undefined' : _typeof(gt)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The argument for query.gt should be an object.');
    return this;
  }
  this.query.gt = gt;
  return this;
};

Query.prototype.order = function (order) {
  if (!order) {
    order = 10;
  }
  if ((typeof order === 'undefined' ? 'undefined' : _typeof(order)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The argument for query.order should be an object.');
    return this;
  }
  this.query.order = order;
  return this;
};

Query.prototype.row = function (row) {
  return this.rows[name] = new Row(this, name);
};

Query.prototype.returnChanges = function (bool) {
  if (bool === undefined) {
    bool = true;
  }
  if (typeof bool !== 'boolean') {
    this.telescope.emitAndWarn('error', 'The argument for query.returnChanges should be a boolean.');
    return this;
  }
  this.query.returnChanges = bool;
  return this;
};

Query.prototype.subscribe = function (success, error) {
  this.telescope._send({
    e: 'subscribe',
    t: this.table.name,
    db: this.db.name,
    d: this.query
  }, {
    success: success,
    error: error
  });

  return this;
};

Query.prototype.fetch = function (success, error) {
  this.telescope._send({
    e: 'fetch',
    t: this.table.name,
    db: this.db.name,
    d: this.query
  }, {
    success: success,
    error: error
  });

  return this;
};

Query.prototype.delete = function (success, error) {
  this.telescope._send({
    e: 'delete',
    t: this.table.name,
    db: this.db.name,
    d: this.query
  }, {
    success: success,
    error: error
  });

  return this;
};

Query.prototype.replace = function (data, success, error) {
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The first argument for query.replace should be an object.');
    return this;
  }

  this.query.replace = data;

  this.telescope._send({
    e: 'replace',
    t: this.table.name,
    db: this.db.name,
    d: this.query
  }, {
    success: success,
    error: error
  });

  return this;
};

Query.prototype.store = function (data, success, error) {
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
    this.telescope.emitAndWarn('error', 'The first argument for query.store should be an object.');
    return this;
  }

  this.query.replace = data;

  this.telescope._send({
    e: 'replace',
    t: this.table.name,
    db: this.db.name,
    d: data
  }, {
    success: success,
    error: error
  });

  return this;
};

Query.prototype.update = function (success, error) {

  var rows = [];
  var keys = Object.keys(this.rows);
  var i = 0,
      length = keys.length;
  var row;

  for (i; i < length; i++) {
    row = this.rows[keys[i]];

    rows.push({
      name: row.name,
      query: row.query
    });
  }

  this.query.rows = rows;

  this.telescope._send({
    e: 'update',
    t: this.table.name,
    db: this.db.name,
    d: this.query
  }, {
    success: success,
    error: error
  });

  return this;
};

var instance = new Telescope();
exports.default = instance;

module.exports = instance;