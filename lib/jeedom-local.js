'use strict';

/**
 * Module dependencies
 */

const request = require('request');
const extend = require('deep-extend');

// Package version
const VERSION = require('../package.json').version;

function JeedomLocal(options) {
  if (!(this instanceof JeedomLocal)) {
    return new JeedomLocal(options);
  }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    base_url: null,
    api_key: null,
    request_options: {
      headers: {
        Accept: '*/*',
        Connection: 'close',
        'User-Agent': 'jeedom-local/' + VERSION
      }
    }
  }, options);

  // Configure default request options
  this.request = request.defaults(
    this.options.request_options
  );
}

JeedomLocal.prototype.__buildEndpoint = function() {
  return `${this.options.base_url}/core/api/jeeApi.php`;
};

JeedomLocal.prototype.__request = function(type, params) {

  // Build the options to pass to our custom request object
  const options = {
    method: 'get',  // Request method - get || post
    url: this.__buildEndpoint(), // Generate url
    qs: extend(
      {
        apikey: this.options.api_key,
        type: type
      },
      params
    )
  };

  var _this = this;
  return new Promise(function(resolve, reject) {
    _this.request(options, function(error, response, data) {

      // request error
      if (error) {
        return reject(error);
      }

      // status code errors
      if(response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // no errors
      resolve(data);
    });
  });
};

/**
 * Execute command and retrieve results
 *
 * @param {integer} id - scenario id.
 * @param {string} action - action to execute ('start', 'stop', 'désactiver' or 'activer').
 * @param {string} [tags] - when action is 'start', you can add tags (example 'foo=1 bar=2').
 */
JeedomLocal.prototype.scenario = function(id, action, tags) {
  return this.__request('scenario', { id, action, tags });
};

/**
 * Execute command and retrieve results
 *
 * @param {integer} id - command id.
 */
JeedomLocal.prototype.command = function(id) {
  return this.__request('cmd', { id });
};

/**
 * Push message to the message center
 *
 * @param {string} category - command id.
 * @param {string} message - command id.
 */
JeedomLocal.prototype.message = function(category, message) {
  return this.__request('message', { category, message });
};

/**
 * Return all objects
 */
JeedomLocal.prototype.object = function() {
  return this.__request('object')
    .then(function(data) {
      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        return JSON.parse(data);
      } catch(parseError) {
        throw new Error('JSON parseError: ' + data);
      }
    });
};

/**
 * Retrieve object equipments
 *
 * @param {integer} id - object id.
 */
JeedomLocal.prototype.equipment = function(id) {
  return this.__request('eqLogic', { object_id: id })
    .then(function(data) {
      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        return JSON.parse(data);
      } catch(parseError) {
        throw new Error('JSON parseError: ' + data);
      }
    });
};

/**
 * Retrieve equipment commands
 *
 * @param {integer} id - equipment id.
 */
JeedomLocal.prototype.equipmentCommands = function(id) {
  return this.__request('command', { eqLogic_id: id })
    .then(function(data) {
      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        return JSON.parse(data);
      } catch(parseError) {
        throw new Error('JSON parseError: ' + data);
      }
    });
};

/**
 * Retrieve full data
 */
JeedomLocal.prototype.fullData = function() {
  return this.__request('fullData')
    .then(function(data) {
      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        return JSON.parse(data);
      } catch(parseError) {
        throw new Error('JSON parseError: ' + data);
      }
    });
};

module.exports = JeedomLocal;
