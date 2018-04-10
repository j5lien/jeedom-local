'use strict';

const assert = require('assert');
const nock = require('nock');
const JeedomLocal = require('../lib/jeedom-local');
const VERSION = require('../package.json').version;

describe('JeedomLocal', function() {

  describe('Constructor', function() {
    let defaults = {};
    before(function() {
      defaults = {
        base_url: null,
        api_key: null,
        request_options: {
          headers: {
            Accept: '*/*',
            Connection: 'close',
          }
        }
      };
    });

    it('create new instance', function() {
      const client = new JeedomLocal();
      assert(client instanceof JeedomLocal);
    });

    it('auto constructs', function() {
      // eslint-disable-next-line new-cap
      const client = JeedomLocal();
      assert(client instanceof JeedomLocal);
    });

    it('has default options', function() {
      const client = new JeedomLocal();
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      );
    });

    it('accepts and overrides options', function() {
      const options = {
        base_url: 'http://127.0.0.1',
        power: 'Max',
        request_options: {
          headers: {
            'User-Agent': 'test'
          }
        }
      };

      const client = new JeedomLocal(options);

      assert(client.options.hasOwnProperty('power'));
      assert.equal(client.options.power, options.power);

      assert.equal(client.options.base_url, options.base_url);

      assert.equal(
        client.options.request_options.headers['User-Agent'],
        options.request_options.headers['User-Agent']
      );
    });

    it('has pre-configured request object', function(next) {
      const client = new JeedomLocal({
        base_url: 'http://127.0.0.1',
        api_key: '12345',
        request_options: {
          headers: {
            foo: 'bar'
          }
        }
      });

      assert(client.hasOwnProperty('request'));

      nock('http://127.0.0.1').get('/').reply(200);
      client.request.get('http://127.0.0.1/', function(error, response) {

        const headers = response.request.headers;

        assert(headers.hasOwnProperty('foo'));
        assert(headers.foo, 'bar');

        assert.equal(headers['User-Agent'], 'jeedom-local/' + VERSION);

        next();
      });
    });
  });

  describe('Methods', function() {
    describe('__buildEndpoint()', function() {
      let client;
      const apiKey = '1234';

      before(function() {
        client = new JeedomLocal({
          base_url: 'http://127.0.0.1',
          api_key: apiKey
        });
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        assert.equal(
          client.__buildEndpoint(),
          'http://127.0.0.1/core/api/jeeApi.php'
        );
      });
    });

    describe('__request()', function(){
      before(function(){
        this.nock = nock('http://127.0.0.1');
        this.client = new JeedomLocal({
          base_url: 'http://127.0.0.1',
        });
      });

      it('accepts any 2xx response', function(done) {
        var response = 'jeedom';
        this.nock.get(/.*/).reply(201, response);
        this.client.__request('cmd', { id: 4 })
          .then(data => {
            assert.equal(data, response);
            done();
          });
      });

      it('allows an empty response', function(done){
        this.nock.get(/.*/).reply(201, '');
        this.client.__request('get', '/device')
          .then(data => {
            assert.equal(data, '');
            done();
          });
      });

      it('errors when there is a bad http status code', function(done) {
        this.nock.get(/.*/).reply(500, '{}');
        this.client.__request('get', '/device')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('errors on a request or network error', function(done) {
        this.nock.get(/.*/).replyWithError('something bad happened');
        this.client.__request('get', '/device')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });
    });
  });
});
