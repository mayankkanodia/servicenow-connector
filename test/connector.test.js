'use strict';

const URL = 'https://dev10130.service-now.com',
    USERNAME = 'admin',
    PASSWORD = 'Feb?0593',
    DEVICE_TABLE_NAME = 'u_devices',
    DATA_TABLE_NAME = 'u_data';

var cp        = require('child_process'),
	should    = require('should'),
	deviceId1 = Date.now(),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);
		setTimeout(function () {
			connector.kill('SIGKILL');
			done();
		}, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						url: URL,
						username: USERNAME,
                        password: PASSWORD,
                        device_table_name: DEVICE_TABLE_NAME,
                        data_table_name: DATA_TABLE_NAME
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#adddevice', function () {
		it('should add the device', function (done) {
			connector.send({
				type: 'adddevice',
				data: {
					_id: 'Reekoh123',
					name: 'Reekoh Device'
				}
			}, done);
		});
	});

	describe('#removedevice', function () {
		it('should remove the device', function (done) {
			connector.send({
				type: 'removedevice',
				data: {
					_id: 'Reekoh123',
					name: 'Reekoh Device'
				}
			}, done);
		});
	});

	describe('#data', function (done) {
		it('should process the data', function () {
			connector.send({
				type: 'data',
				data: {
                    u_title: 'Test',
                    u_description: 'This is a test data from ServiceNow Connector Plugin.'
				}
			}, done);
		});
	});
});