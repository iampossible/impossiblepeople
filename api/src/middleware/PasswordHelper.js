'use strict';

const password = require('password');
const Sequence = require('impossible-promise');

class PasswordHelper {

  constructor(bcrypt) {
    this.bcrypt = bcrypt;
    this.saltRounds = 5;
  }

  generatePassword() {
    return password(3).split(' ').join('');
  }

  validatePassword(inputPassword, hashedPassword) {
    return new Sequence((accept, reject) => {
      this.bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
        if (err) return reject(err);
        accept(result);
      });
    });
  }

  hashPassword(inputPassword) {
    return new Sequence((accept, reject) => {
      this.bcrypt.genSalt(this.saltRounds, (err, salt) => {
        if (err) return reject(err);
        accept(salt);
      });
    }).then((accept, reject, salt) => {
      this.bcrypt.hash(inputPassword, salt, (err, hash) => {
        if (err) return reject(err);
        accept(hash);
      });
    }).done((salt, hash) => hash);
  }
}

const bcrypt = require('bcrypt');
module.exports = new PasswordHelper(bcrypt);
