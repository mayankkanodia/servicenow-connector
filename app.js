'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let get = require('lodash.get')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let uuid = require('node-uuid')
let request = require('request')

let sendData = (data, callback) => {
  let sysid = ''

  if (!isEmpty(_plugin.config.idField)) {
    sysid = data[_plugin.config.idField]
    delete data[_plugin.config.idField]
  }

  if (isEmpty(sysid)) { sysid = uuid.v4() }

  data['sys_id'] = sysid

  request.post({
    url: `${_plugin.config.url}/api/now/table/${_plugin.config.dataTableName}`,
    auth: {
      user: _plugin.config.username,
      pass: _plugin.config.password
    },
    json: data
  }, (error, response, body) => {
    if (error) return callback(error)

    if (isEmpty(get(body, 'error'))) {
      _plugin.log(JSON.stringify({
        title: 'Data inserted to ServiceNow table.',
        data: data
      }))
      callback()
    } else {
      callback(body.error)
    }
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (!isEmpty(error)) {
        console.error(error)
        _plugin.logException(new Error(error))
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (!isEmpty(error)) {
        console.error(error)
        _plugin.logException(new Error(error))
      }
    })
  } else {
    _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`))
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  if (_plugin.config.url.endsWith('/')) {
    _plugin.config.url = _plugin.config.url.slice(0, -1)
  }

  _plugin.log('ServiceNow Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
