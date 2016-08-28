import EventEmitter from 'events';

class Store extends EventEmitter{
  constructor(client, query){
    super();

    this.client = client;
    this.query = query;

    this.fetch();
    this.listen();

    this.data = [];

    // return this.data;
  }
  fetch(){
    console.log('fetch');
    this.query.run(this.client.connection, this.onFetch.bind(this));
  }
  onFetch(error, cursor){
    if(error){ this.emit('error', error); return; }
    cursor.toArray((err, results) => {
      if(err){ this.emit('error', error); return; }
      this.data = results;
      this.emit('init', results);
    });
  }
  listen(){
    this.query
      .changes()
      .run(this.client.connection, this.onChange.bind(this))
  }
  onChange(err, cursor){
    cursor.each((error, item) => {
      if(error){ this.emit('error', error); return; }

      if(item.new_val !== null && item.old_val === null){
        this.emit('add', item.new_val);
      }else if(item.new_val !== null && item.old_val !== null){
        this.emit('change', item.new_val, item.old_val);
      }else if(item.new_val === null && item.old_vall !== null){
        this.emit('delete', item.old_vall);
      }
    })
  }
}

export default Store;