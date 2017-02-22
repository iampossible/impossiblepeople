'use strict';

const request = require('request');
const gnomeApi = require('ImpossibleApi');
const Config = require('config/server');
const Model = require('core/Model');
const Sequence = require('impossible-promise');


describe('Status', () => {

  beforeAll(() => {
    gnomeApi.start();
  });

  function getStatus(expectations) {
    let url = `http://${Config.endpoint}/`;
    request.get(url, { time: true }, expectations);
  }

  describe('GET /', () => {
    it('should return the api status', (done) => {
      getStatus((err, response) => {
        let body = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('fabulous');
        done();
      });
    });

    it('should return the api version', (done) => {
      getStatus((err, response) => {
        let body = JSON.parse(response.body);
        expect(body.version).toBeDefined();
        done();
      });
    });

    it('should return the database status', (done) => {
      getStatus((err, response) => {
        let body = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(body.database).toBe('amazing');
        done();
      });
    });

    it('should return 503 if the status is NOT OK', (done) => {

      spyOn(Model, 'status').and.callFake(() => {
        return new Sequence(accept => accept(false));
      });

      getStatus((err, response) => {
        let body = JSON.parse(response.body);
        expect(response.statusCode).toBe(503);
        expect(body.database).toBe('failing');
        expect(body.status).toBe('not cool');
        done();
      });
    });
  });
});
