/*

  Todo:

  - [ ] Reconnect auto

 */
import EventEmitter from 'events';
import RethinkClient from 'rethinkdb-websocket-client/dist/node';
const r = RethinkClient.rethinkdb;

import Store from './store';

class Client extends EventEmitter{
  constructor(key, options = {}){
    super();

    this.connection = undefined;
    this.options = {
      key: key || options.key || '',
      host: options.host || 'localhost',
      port: options.port || 8000,
      secure: false,
      db: options.db || undefined,
      path: `/?${key}`
    };

    this.connect();
  }

  connect(){
    // Connect.
    RethinkClient
      .connect(this.options)
      .then(this.connectionDidConnect.bind(this))
      .catch(this.connectionDidError.bind(this))
  }

  connectionDidConnect(connection){
    this.connection = connection;
    console.log('connect');
    this.emit('connect');
  }

  connectionDidError(error){
    // console.log(error);
    this.emit('error', error);
  }

  Store(query){
    return new Store(this, query);
  }
};

export {
  Client as default
}

// Client example.
let cl = new Client('safdhoiyaos76dfsd8fo6as9df6s', {
  db: 'telescope'
});

cl.on('connect', () => {
 // var query = r.table('notifications');

  let store = cl.Store(
    r.table('notifications')
  )

  store.on('add', (row) => {
    console.log('add', row)
  })

  store.on('delete', (row) => {
    console.log('delete', row)
  })

  store.on('update', (row) => {
    console.log('update', row);
  })
  store.on('init', (row) => {
    console.log('init', row);
  })
  // store.on('error', (row) => {
  //   console.log('error', row);
  // })



  // query.run(cl.connection, function(err, cursor) {
  //   cursor.toArray(function(err, results) {
  //     console.log(results);
  //   });
  // });
});
