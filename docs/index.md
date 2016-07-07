# Telescope Service

```js
import Telescope, {
	Device,
	Process,
	Expire,
} from 'thesuitcase-telescope';

Telescope.connect({
	device: new Device('macbook'),
	process: new Process(),
	key: '9sd8s9',
});

// Table. (array)
let {data as notifications, storage} = Telescope.db('telescope').table('notifications').liveStorage();

storage.onDelete .onUpdate
storage.store() // + normal table functionality.
store.get('...').delete()


Telescope.plugin({
	
	// Send notifications.
	this.notification.create({
		title: 'Hello',
		description: 'We love you!',
		exprire: Expire.days(1),
		phone: true, // Send only to phone.
		macbook: false,
	})
	
});