# Jeedom Local 1.0.0

An asynchronous client library for the [API of Jeedom](https://jeedom.github.io/core/fr_FR/api_http) in local network. 

```javascript
const JeedomLocal = require('jeedom-local');

const client = new JeedomLocal({
  base_url: '',
  api_key: ''
});

client.command(5)
  .then(console.log)
  .catch(console.error);
```

## Installation

`npm install jeedom-local`

You will need to retrieve your api key and internal ip. You can follow instructions [here](https://jeedom.github.io/core/fr_FR/api_http). 

```javascript
const JeedomLocal = require('jeedom-local');

const client = new JeedomLocal({
  base_url: 'http://<internal ip>',
  api_key: '<api key>'
});
```

## Requests

You can use the defined client methods to call endpoints.

```javascript
client.message('test', 'Add message in message center');
```

## Promises

The request will return Promise.


```javascript
client.fullData()
  .then(function (data) {
    console.log(data);
  })
  .catch(function (e) {
    throw e;
  });
```
