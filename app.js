'use strict';

var platform = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	isArray = require('lodash.isarray'),
	request = require('request'),
	async = require('async'),
	isEmpty = require('lodash.isempty'),
	uuid = require('node-uuid'),
	config;

let sendData = (data, callback) => {
	var sysid = '';

	if(!isEmpty(config.id_field)) {
		sysid = data[config.id_field];
		delete data[config.id_field];
	}

	if(isEmpty(sysid))
		sysid = uuid.v4();

	data.sys_id = sysid;
	
	request.post({
		url: config.url + '/api/now/table/' + config.data_table_name,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: data
	}, (error, response, body) => {
		if(isEmpty(body.error)){
			platform.log(JSON.stringify({
				title: 'Data inserted to ServiceNow table.',
				data: data
			}));
		}

		callback(body.error);
	});
};

let addDevice = (device, callback) => {
	request.post({
		url: config.url + '/api/now/table/' + config.device_table_name,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: device
	}, (error, response, body) => {
		if(isEmpty(body.error)){
			platform.log(JSON.stringify({
				title: 'Device added to ServiceNow table.',
				data: device
			}));
		}

		callback(body.error);
	});
};

let removeDevice = (device, callback) => {
	request.del({
		url : config.url + '/api/now/table/' + config.device_table_name + '/' + device.id,
		auth: {
			user: config.username,
			pass: config.password
		},
		json: false
	}, (error, response, body) => {
		if(isEmpty(body.error)){
			platform.log(JSON.stringify({
				title: 'Device removed from ServiceNow table.',
				data: device
			}));
		}

		callback(body.error);
	});
};

platform.on('data', function (data) {
	if(isPlainObject(data)){
		sendData(data, (error) => {
			if(!isEmpty(error)) {
				console.error(error);
				platform.handleException(error);
			}
		});
	}
	else if(isArray(data)){
		async.each(data, (datum, done) => {
			sendData(datum, done);
		}, (error) => {
			if(!isEmpty(error)) {
				console.error(error);
				platform.handleException(error);
			}
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.on('adddevice', function (device) {
	device.sys_id = device.id;

	addDevice(device, (error) => {
		if(!isEmpty(error)) {
			console.error(error);
			platform.handleException(error);
		}
	});
});

platform.on('removedevice', function (device) {
	removeDevice(device, (error) => {
		if(!isEmpty(error)) {
			console.error(error);
			platform.handleException(error);
		}
	});
});

platform.once('close', function () {
	let d = require('domain').create();

	d.once('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function() {
		// TODO: Release all resources and close connections etc.
		platform.notifyClose(); // Notify the platform that resources have been released.
		d.exit();
	});
});

platform.once('ready', function (options, registeredDevices) {
	config = options;

	if(config.url.endsWith('/'))
		config.url = config.url.slice(0, -1);

	async.each(registeredDevices, function(datum, done){
		addDevice(datum, done);
	}, (error) => {
		if(!isEmpty(error)) {
			console.error(error);
			platform.handleException(error);
		}
	});

	platform.notifyReady();
	platform.log('ServiceNow Connector has been initialized.');
});