'use strict'

const amqp = require('amqplib')

const URL = 'https://dev12467.service-now.com/'
const USERNAME = 'admin'
const PASSWORD = 'achilles123'
const DEVICE_TABLE_NAME = 'u_devices'
const DATA_TABLE_NAME = 'u_data'

let _channel = null
let _conn = null
let app = null
let uuid = require('node-uuid')

describe('ServiceNow Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      url: URL,
      username: USERNAME,
      password: PASSWORD,
      deviceTableName: DEVICE_TABLE_NAME,
      dataTableName: DATA_TABLE_NAME
    })
    process.env.INPUT_PIPE = 'ip.servicenow'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        dataTableName: DATA_TABLE_NAME,
        'u_title': uuid.v4(),
        'u_description': 'This is a test data from ServiceNow Connector Plugin.'
      }

      _channel.sendToQueue('ip.servicenow', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})

// 'use strict';
//
// const URL = 'https://dev12467.service-now.com/',
//     USERNAME = 'admin',
//     PASSWORD = 'achilles123',
//     DEVICE_TABLE_NAME = 'u_devices',
//     DATA_TABLE_NAME = 'u_data';
//
// var cp        = require('child_process'),
// 	should    = require('should'),
// 	deviceId1 = Date.now(),
// 	uuid = require('node-uuid'),
// 	connector;
//
// describe('Connector', function () {
// 	this.slow(5000);
//
// 	after('terminate child process', function (done) {
// 		this.timeout(7000);
// 		setTimeout(function () {
// 			connector.kill('SIGKILL');
// 			done();
// 		}, 5000);
// 	});
//
// 	describe('#spawn', function () {
// 		it('should spawn a child process', function () {
// 			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
// 		});
// 	});
//
// 	describe('#handShake', function () {
// 		it('should notify the parent process when ready within 5 seconds', function (done) {
// 			this.timeout(5000);
//
// 			connector.on('message', function (message) {
// 				if (message.type === 'ready')
// 					done();
// 			});
//
// 			connector.send({
// 				type: 'ready',
// 				data: {
// 					options: {
// 						url: URL,
// 						username: USERNAME,
//                         password: PASSWORD,
//                         device_table_name: DEVICE_TABLE_NAME,
//                         data_table_name: DATA_TABLE_NAME
// 					}
// 				}
// 			}, function (error) {
// 				should.ifError(error);
// 			});
// 		});
// 	});
//
// 	describe('#adddevice', function () {
// 		it('should add the device', function (done) {
// 			connector.send({
// 				type: 'adddevice',
// 				data: {
// 					_id: 'Reekoh123',
// 					name: 'Reekoh Device'
// 				}
// 			}, done);
// 		});
// 	});
//
// 	describe('#removedevice', function () {
// 		it('should remove the device', function (done) {
// 			connector.send({
// 				type: 'removedevice',
// 				data: {
// 					_id: 'Reekoh123',
// 					name: 'Reekoh Device'
// 				}
// 			}, done);
// 		});
// 	});
//
// 	describe('#data', function (done) {
// 		it('should process the data', function () {
// 			connector.send({
// 				type: 'data',
// 				data: {
// 					data_table_name: DATA_TABLE_NAME,
//                     u_title: uuid.v4(),
//                     u_description: 'This is a test data from ServiceNow Connector Plugin.'
// 				}
// 			}, done);
// 		});
// 	});
// });