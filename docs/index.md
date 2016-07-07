# Telescope Client

```js
import Telescope from 'thesuitcase-telescope-client';

Telescope.connect(<secretkey>);

Telescope.on('connect', () => {
	console.log('Let\'s start using the database');
	
	let notifications = 
		Telescope
			.db('yourapp')
			.table('notifications')
			.fetch(
				notifications => console.log(notifications),
				error => console.log(`Error: ${error}`)
			)

});

Telescope.on('disconnect', () => {
	console.log('We disconnected from the server');
});