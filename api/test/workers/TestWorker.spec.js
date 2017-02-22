'use strict';

const gnomeWorker = require('ImpossibleWorker');
const helpers = require('../helpers');


const OLD_DEFAULT_TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('TestWorker', () => {

  var worker = gnomeWorker.get('TestWorker');

  beforeAll((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 55000;
    gnomeWorker.start().then(done);
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = OLD_DEFAULT_TIMEOUT_INTERVAL;
  });

  it('fake queue should work', (done) => {
    // MSG
    helpers.publishMsg('test', 'SOME_TEST_EVENT', { foo: 'bar' });

    helpers.waitForMsg(worker, 'SOME_TEST_EVENT', (msg, msgID) => {
      console.log('got SOME_TEST_EVENT');
      expect(msg).toBeDefined();
      expect(msgID).toBeDefined();
      expect(msg.data.foo).toBe('bar');
      done();
    });
  });

  it('receives TEST_EVENT notification and forward it to onTest', (done) => {
    // MSG
    helpers.publishMsg('test', 'TEST_EVENT', { foo: 'bar' });

    // inject spy on the worker
    spyOn(worker, 'onTest');
    worker.ev.TEST_EVENT[0] = worker.onTest;

    helpers.waitForMsg(worker, 'TEST_EVENT', () => {
      expect(worker.onTest).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
      done();
    });
  });
});
