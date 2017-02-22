'use strict';

const bcrypt = require('bcrypt');

let BcryptHelper = require('middleware/PasswordHelper');

const input = 'somepassword';
const salt = '$2a$05$Q/IdxKogyN.kkhtsMvq2zO';
const output = `${salt}Jh3kDOdEUowrTtY8HwbTUSV1ruvRJxC`;
const errMsg = 'error!';

describe('PasswordHelper class', () => {
  let helper;

  beforeEach(() => {
    helper = new BcryptHelper.constructor(bcrypt);
  });

  describe('generatePassword method', () => {
    it('should return a string with at least 12 characters', () => {
      let password1 = helper.generatePassword();
      expect(password1).toEqual(jasmine.any(String));
      expect(password1.length).toBeGreaterThan(12);
    });

    it('should return a different string each time', () => {
      let passwords = [];
      for (let i = 0; i < 5; i++) {
        let word = helper.generatePassword();
        expect(passwords).not.toContain(word);
        passwords.push(word);
      }
    });
  });

  describe('hashPassword method', () => {
    it('should resolve with a hashed password', (done) => {
      spyOn(bcrypt, 'genSalt').and.callFake((rounds, callback) => {
        expect(rounds).toEqual(5);
        callback(null, salt);
      });

      helper.hashPassword(input).done((result) => {
        expect(result).toEqual(output);
        done();
      });
    });

    it('should reject if the salting fails', (done) => {
      spyOn(bcrypt, 'genSalt').and.callFake((rounds, callback) => callback(errMsg));
      spyOn(bcrypt, 'hash');
      helper.hashPassword(input, output).error((err) => {
        expect(err).toEqual(errMsg);
        expect(bcrypt.hash).not.toHaveBeenCalled();
        done();
      });
    });

    it('should reject if the hashing fails', (done) => {
      spyOn(bcrypt, 'genSalt').and.callFake((rounds, callback) => {
        expect(rounds).toEqual(5);
        callback(null, salt);
      });
      spyOn(bcrypt, 'hash').and.callFake((pwd, salt, callback) => callback(errMsg));

      helper.hashPassword(input, output).error((err) => {
        expect(err).toEqual(errMsg);
        done();
      });
    });
  });

  describe('validatePassword method', () => {
    it('should resolve true for valid password', (done) => {
      helper.validatePassword(input, output).done((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    it('should resolve false for invalid password', (done) => {
      helper.validatePassword('garbage', output).done((result) => {
        expect(result).toBeFalsy();
        done();
      });
    });

    it('should reject if the comparison fails', (done) => {
      spyOn(bcrypt, 'compare').and.callFake((pwd, hash, callback) => callback(errMsg));
      helper.validatePassword(input, output).error((err) => {
        expect(err).toEqual(errMsg);
        done();
      });
    });
  });
});
