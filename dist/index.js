// Websocket polyfill for nodeJS.
const Ws = require('ws');
var WebSocket = Ws;

(function(undefined){
  
  @include 'client.js'

  window.Telescope = Telescope;

}())

var instance = new Telescope();
export default instance;
module.exports = instance;