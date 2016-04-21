# ServiceNow Connector
[![Build Status](https://travis-ci.org/Reekoh/mnubo-connector.svg)](https://travis-ci.org/Reekoh/servicenow-connector)
![Dependencies](https://img.shields.io/david/Reekoh/servicenow-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/servicenow-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

ServiceNow Connector Plugin Connector for the Reekoh IoT Platform. Connects a Reekoh Instance with ServiceNow's Table API to push and synchronize device data.

## Description
This plugin writes data to an existing table in ServiceNow.

## Configuration
To configure this plugin, a running ServiceNow Instance is needed to provide the following:

1. Username - The ServiceNow Instance Username to use.
2. Password - The corresponding ServiceNow Password to use.
3. Device Table Name - The Service now table Name in which your devices will be saved/registered.
3. Data Table Name - The Service now table Name in which your data will be saved/registered.
4. Id Field (optional) - The field in your input that will be the record ID in ServiceNow table.

These parameters are then injected to the plugin from the platform.

## Sample input data
```
{
    u_title: 'Test',
    u_description: 'This is a test data from ServiceNow Connector Plugin.'
}
```

Please note that the fields in your input data should be the same as the field in your ServiceNow table.