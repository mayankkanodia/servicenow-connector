'use strict';

var uuid          = require('node-uuid'),
	async         = require('async'),
	isArray       = require('lodash.isarray'),
	request       = require('request'),
	isEmpty       = require('lodash.isempty'),
	platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	get = require('lodash.get'),
	config;

let sendData = (data, callback) => {
	let sysid = '';

	if (!isEmpty(config.id_field)) {
		sysid = data[config.id_field];
		delete data[config.id_field];
	}

	if (isEmpty(sysid))
		sysid = uuid.v4();

	data.sys_id = sysid;

	request.post({
		url: `${config.url}/api/now/table/${config.data_table_name}`,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: data
	}, (error, response, body) => {
		if (isEmpty(get(body, 'error'))) {
			platform.log(JSON.stringify({
				title: 'Data inserted to ServiceNow table.',
				data: data
			}));
			callback();
		}
        else
		    callback(body.error);
	});
};

let addDevice = (device, callback) => {
	request.post({
		url: `${config.url}/api/now/table/${config.device_table_name}`,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: device
	}, (error, response, body) => {
		if (isEmpty(body.error)) {
			platform.log(JSON.stringify({
				title: 'Device added to ServiceNow table.',
				data: device
			}));
		}

		callback(body.error);
	});
};

platform.on('data', function (data) {
	if (isPlainObject(data)) {
		sendData(data, (error) => {
			if (!isEmpty(error)) {
				console.error(error);
				platform.handleException(new Error(error));
			}
		});
	}
	else if (isArray(data)) {
		async.each(data, (datum, done) => {
			sendData(datum, done);
		}, (error) => {
			if (!isEmpty(error)) {
				console.error(error);
				platform.handleException(new Error(error));
			}
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.on('adddevice', function (device) {
	addDevice({
		sys_id: device._id,
		u_name: device.name
	}, (error) => {
		if (!isEmpty(error)) {
			console.error(error);
			platform.handleException(new Error(error));
		}
	});
});

platform.on('removedevice', function (device) {
	request.del({
		url: `${config.url}/api/now/table/${config.device_table_name}/${device._id}`,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: true
	}, (error, response, body) => {
		if (isEmpty(body.error)) {
			platform.log(JSON.stringify({
				title: 'Device removed from ServiceNow table.',
				data: device
			}));
		}
		else {
			console.error(error);
			platform.handleException(new Error(error));
		}
	});
});

platform.once('close', function () {
	platform.notifyClose();
});

platform.once('ready', function (options) {
	config = options;

	if (config.url.endsWith('/'))
		config.url = config.url.slice(0, -1);

	platform.notifyReady();
	platform.log('ServiceNow Connector has been initialized.');
});