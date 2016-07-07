# Notification

## Usage
```js
import Telescope, {
  Notification
} from 'telescope';

// Or
Telescope.Notification
```


## Api



## Example
```js

new Notification()
	.title('Hello world')
	.description('We love you!');
	.device({phone: true, macbook: false}) // Default: all true
	.send();

// or
new Notification({
	title: 'Hello world',
	description: 'We love you!', 
	device: {
		phone: true,
	}
	}).send();

```