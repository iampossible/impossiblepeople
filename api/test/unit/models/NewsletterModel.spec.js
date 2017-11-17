/* globals jasmine, describe, expect, it, beforeEach, afterEach, fail */

'use strict';

const crypto = require('crypto');

var newsletterModel = require('models/NewsletterModel');
const config = require('config/server');

describe('Newsletter Model', () => {
  const testSeedUser = {
    userID: '37619fc1',
    email: 'follow.me@example.com'
  };
  describe('unsubscribe method', () => {
    beforeEach(() => {
      // reset newsletterModel object and all spies
      newsletterModel = new newsletterModel.constructor();
    });

    it('should call database with correct number of arguments', (done) => {
      spyOn(newsletterModel.db, 'query')
        .and
        .callFake((query, object, callback) => {
          callback(null, [testSeedUser]);
        });
      // TODO set algo consistently with Model
      const d = crypto.createCipher('aes256', config.settings.newsletter_key);

      let raw = d.update(`${testSeedUser.userID};${testSeedUser.email};${Date.now().valueOf() - 10000}`, 'utf8', 'hex');
      raw += d.final('hex');

      newsletterModel.unsubscribe(raw).done(() => {
        expect(newsletterModel.db.query)
          .toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object), jasmine.any(Function));
        done();
      }).error((err) => {
        fail(err);
        done();
      });
    });

    it('should reject if code timestamp is in the future', (done) => {
      spyOn(newsletterModel.db, 'query')
        .and
        .callFake((query, object, callback) => {
          callback(null, [testSeedUser]);
        });
      // TODO set algo consistently with Model
      const d = crypto.createCipher('aes256', config.settings.newsletter_key);

      let raw = d.update(`${testSeedUser.userID};${testSeedUser.email};${Date.now().valueOf() + 10000}`, 'utf8', 'hex');
      raw += d.final('hex');

      newsletterModel.unsubscribe(raw).done(() => {
        fail('Request should fail');
        done();
      }).error((err) => {
        expect(err).toBeDefined();
        expect(err.code).toBe(400);
        expect(err.msg).toBe('Invalid timestamp');
        done();
      });
    });

    it('should reject if query fails', (done) => {
      spyOn(newsletterModel.db, 'query')
        .and
        .callFake((query, object, callback) => {
          callback('feed query failed');
        });
      newsletterModel.unsubscribe('randomstuff')
        .done(() => {
          fail('Request should fail');
          done();
        }).error((err) => {
          expect(err).toBeDefined();
          done();
        });
    });
  });
});
