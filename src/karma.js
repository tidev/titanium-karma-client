/* global global */

import EventEmitter from 'eventemitter3';
import io from 'ti.socketio';

import http from './http';

/**
 * Client to connect to the Karma server.
 *
 * Based on https://github.com/karma-runner/karma/blob/master/client/karma.js
 */
export default class KarmaClient extends EventEmitter {
	constructor(baseUrl) {
		super();

		this.baseUrl = baseUrl;
		this.startEmitted = false;
		this.resetResultCounters();
		this.config = {};

		global.__karma__ = this;
	}

	connect() {
		Ti.API.debug(`Connecting to ${this.baseUrl}`);
		this.socket = io.connect(this.baseUrl);
		this.socket.on('connect', () => {
			this.socket.emit('register', {
				id: 'Titanium-' + Math.floor(Math.random() * 10000),
				name: `Titanium ${Ti.version} (${Ti.Platform.name} ${Ti.Platform.model})`
			});
		});
		this.socket.on('execute', this.executeTestRun.bind(this));
		this.socket.on('stop', this.complete.bind(this));
		this.socket.on('disconnect', reason => Ti.API.debug(`Socket disconnected with reason ${reason}`));
	}

	executeTestRun(config) {
		Ti.API.debug('Karma requested test run execution.');
		Ti.API.debug(config);

		this.emit('execute');

		this.startEmitted = false;
		this.config = config;

		this.resetResultCounters();

		const karmaContextUrl = `${this.baseUrl}/context.json`;
		Ti.API.debug(`Downloading file list from ${karmaContextUrl}`);

		http.getJson(karmaContextUrl)
			.then(contextData => {
				return contextData.files;
			})
			.then(scriptUrls => {
				return Promise.all(scriptUrls.map(scriptUrl => {
					return http.getString(`${this.baseUrl}${scriptUrl}`)
						.then(scriptContent => {
							return {
								url: scriptUrl,
								content: scriptContent
							};
						});
				}));
			})
			.then(scripts => {
				scripts.forEach(script => {
					Ti.API.debug(`Evaluating script ${script.url}`);
					try {
						// eslint-disable-next-line no-eval
						var evalInGlobalContext = eval;
						evalInGlobalContext(script.content);
					} catch (e) {
						Ti.API.error(e);
					}
				});

				this.emit('start');

				this.start();
			});
	}

	start() {
		throw new Error('This should be overriden by the Karma adapter of your unit testing framework (e.g. karma-jasmine).');
	}

	error(messageOrEvent, source, lineno, colno, error) {
		let message = messageOrEvent;
		var location = this.getLocation(source, lineno, colno);

		if (location !== '') {
			message += '\nat ' + location;
		}

		if (error) {
			message += '\n\n' + error.stack;
		}

		message = {
			message: message,
			str: message.toString()
		};

		this.socket.emit('karma_error', message);
		this.complete();

		return false;
	}

	getLocation(url, lineno, colno) {
		var location = '';

		if (url !== undefined) {
			location += url;
		}

		if (lineno !== undefined) {
			location += ':' + lineno;
		}

		if (colno !== undefined) {
			location += ':' + colno;
		}

		return location;
	}

	result(originalResult) {
		var convertedResult = {};

		// Convert all array-like objects to real arrays.
		for (var propertyName in originalResult) {
			if (originalResult.hasOwnProperty(propertyName)) {
				var propertyValue = originalResult[propertyName];

				if (Object.prototype.toString.call(propertyValue) === '[object Array]') {
					convertedResult[propertyName] = Array.prototype.slice.call(propertyValue);
				} else {
					convertedResult[propertyName] = propertyValue;
				}
			}
		}

		if (convertedResult.skipped) {
			this.skipped++;
		} else if (convertedResult.success) {
			this.success++;
		} else {
			this.failed++;
		}

		const completed = this.skipped + this.success + this.failed;
		this.emit('result', { completed, total: this.total });

		if (!this.startEmitted) {
			this.socket.emit('start', {
				total: null
			});
			this.startEmitted = true;
		}

		this.socket.emit('result', convertedResult);
	}

	complete(result) {
		this.emit('complete', {
			total: this.total,
			skipped: this.skipped,
			failed: this.failed
		});

		this.socket.emit('complete', result || {}, () => {
			Ti.API.trace('Test run complete');
		});
	}

	info(info) {
		if (!this.startEmitted && typeof info.total !== 'undefined') {
			this.socket.emit('start', info);
			this.startEmitted = true;
			this.total = info.total;
		} else {
			this.socket.emit('info', info);
		}
	}

	resetResultCounters() {
		this.total = this.skipped = this.failed = this.success = 0;
	}
}
