# Karma client for Titanium

> Axway Titanium version of the Karma client

## Installation

```
npm i titanium-karma-client -S
```

## Usage

> :bulb: If you just want to run unit tests consider using the [karma-titanium-launcher](https://github.com/appcelerator/karma-titanium-launcher) wich makes use of this package and does all the required setup for you to test your projects.

This client connects to a Karma server, loads all required files including the testing framework and individual unit tests, executes the tests and then reports the results back to the Karma server. This client is heavily inspired by the default Karma Web client that is used for Browser testing and was adapted to work inside Titanium.

You create a client by instantiating `KarmaClient`, passing it the URL it should connect to. After that you do the actual connect and can optionally bind a few events to listen for status changes.

```js
import KarmaClient from 'titanium-karma-client';
const client = new KarmaClient('http://localhost:9876/?id=123456');
client.connect();
client.on('execute', () => console.log('Loading files ...'));
client.on('result', e => console.log(`Running tests (${e.completed} / ${e.total})`));
client.on('complete', e => {
	let resultMessage = `Executed ${e.total - e.skipped} / ${e.total}`;
	if (e.failed) {
		resultMessage += ` (${e.failed} FAILED)`;
	}
	resultMessage += ' - DONE';
	console.log(resultMessage);
});
```

## Public API

### new KarmaClient(url)

Creates a new KarmaClient instance and sets the URL to connect to. If the URL contains an `id` query parameter the client will register to the Karma server using this identifer. If the parameter is missing the client generates a random identifier to connect with.

| Name | Type | Description |
| --- | --- | --- |
| `url` | `Sring` | The base url of the Karma server to connect to. Can include an optional `id` query param to identify the client. |

### KarmaClient.connect()

Connects to the Karma server and starts the test run.

### Event API

`KarmaClient` implements the Node event emitter API. Refer to https://nodejs.org/api/events.html for a full API documention.

## Events

You can listen to a set of events to respond to certain status changes using the `on` method. Available events are:

* `execute` Emitted when the Karma server sends the `execute` message. This will cause the client to start loading all required files for the test run from the Karma server.
* `result` This event will report the result of each unit test. The event will include information about the current number of completed tests as well as the total number of tests being executed.
  * `completed` `<Number>` The number of completed tests
  * `total` `<Number>` The number of total tests in this test run
* `complete` Emitted when the test run is complete. Includes information about skipped and failed tests and the total number of tests executed.
  * `skipped` `<Number>` Number of skipped tests
  * `failed` `<Number>` Number of failed tests
  * `total` `<Number>` Total tests executed during this run

## Contributions

Open source contributions are greatly appreciated! If you have a bugfix, improvement or new feature, please create
[an issue](https://github.com/appcelerator/titanium-karma-client/issues/new) first and submit a [pull request](https://github.com/appcelerator/titanium-karma-client/compare) against master.

## Getting Help

If you have questions about unit testing your Titanium apps or libraries with Karma, feel free to reach out on Stackoverflow or the
`#helpme` channel on [TiSlack](http://tislack.org). In case you find a bug related to this library, create a [new issue](https://github.com/appcelerator/titanium-karma-client/issues/new)
or open a [new JIRA ticket](https://jira.appcelerator.org).

## License

Apache License, Version 2.0
