'use strict';

const Config = require('config/server');
const loginThrottler = require('middleware/LoginThrottler');
const cache = require('memory-cache');

describe('LoginThrottler', () => {
  let oldLimit;
  let oldPenalty;
  let oldTimeout;

  beforeAll(() => {
    oldLimit = Config.login.limit;
    oldPenalty = Config.login.penalty;
    oldTimeout = Config.login.timeout;
    Config.login.limit = 3;
    Config.login.penalty = 1;
    Config.login.timeout = 50;
  });

  afterAll(() => {
    Config.login.limit = oldLimit;
    Config.login.penalty = oldPenalty;
    Config.login.timeout = oldTimeout;
  });

  beforeEach(() => {
    cache.clear();
  });

  let runXTimes = (limit, email) => {
    var lastPenalty = 0;
    var totalPenalty = 0;
    for (let n = 0; n < limit; n++) {
      totalPenalty += (lastPenalty = loginThrottler(email || 'me@hotmail.com'));
    }
    return { last: lastPenalty, total: totalPenalty };
  };

  it('should not penalize requests below threshold X', () => {
    let penalty = runXTimes(Config.login.limit);

    expect(penalty.last).toBe(0);
    expect(penalty.total).toBe(0);
  });


  it('should penalize requests equal threshold X', () => {
    let penalty = runXTimes(Config.login.limit + 1);

    expect(penalty.last).toBe(1);
    expect(penalty.total).toBe(1);
  });

  it('should increase the penalty in a linear way', () => {
    let penalty = runXTimes(Config.login.limit + 5);

    expect(penalty.last).toBe(5);
    expect(penalty.total).toBe(15);
  });

  it('should reset the penalty after the cache expires', (done) => {
    let penalty = runXTimes(Config.login.limit + 10);

    expect(penalty.last).toBe(10);
    expect(penalty.total).toBe(55);

    setTimeout(() => {
      let timeoutPenalty = runXTimes(1);
      expect(timeoutPenalty.last).toBe(0);
      expect(timeoutPenalty.total).toBe(0);
      done();
    }, 100);
  });

  it('should clear cache after TTL has expired', (done) => {
    let penaltyA = runXTimes(Config.login.limit, 'userA@example.com');
    let penaltyB = runXTimes(Config.login.limit + 5, 'userB@example.com');
    let penaltyC = runXTimes(Config.login.limit + 10, 'userC@example.com');

    expect(cache.keys().length).toBe(3);

    setTimeout(() => {
      expect(cache.keys().length).toBe(0);
      done();
    }, 100);
  });

  it('should generate diferent cache keys for different emails', () => {
    let penaltyA = runXTimes(Config.login.limit, 'userA@example.com');
    let penaltyB = runXTimes(Config.login.limit + 5, 'userB@example.com');
    let penaltyC = runXTimes(Config.login.limit + 10, 'userC@example.com');

    expect(penaltyA.last).toBe(0);
    expect(penaltyA.total).toBe(0);

    expect(penaltyB.last).toBe(5);
    expect(penaltyB.total).toBe(15);

    expect(penaltyC.last).toBe(10);
    expect(penaltyC.total).toBe(55);
  });

});
