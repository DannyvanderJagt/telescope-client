// Websocket polyfill for nodeJS.
const Ws = require('ws');
var WebSocket = Ws;

@include 'client.js'

var instance = new Telescope();

export default instance;
module.exports = instance;