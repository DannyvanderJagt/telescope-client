import Telescope from './node';
// var Telescope = require('./node');
// import NC from './nc';
// import Projects from './projects';

// Connect...
Telescope.connect('sdfa8s');


Telescope.on('connect', () => {
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
