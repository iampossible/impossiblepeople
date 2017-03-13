'use strict';

const password = require('password');
const Sequence = require('impossible-promise');

class PasswordHelper {

  constructor(bcrypt) {
    this.bcrypt = bcrypt;
    this.saltRounds = 5;
  }

  generatePassword() {
    let temp = '';
    while (temp.length <= 12) {
      temp = password(3).split(' ').join('');
    }
    return temp;
  }

  validatePassword(inputPassword, hashedPassword) {
    return new Sequence((accept, reject) => {
      this.bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
        if (err) {
          reject(err);
        } else {
          accept(result);
        }
      });
    });
  }

  hashPassword(inputPassword) {
    return new Sequence((accept, reject) => {
      this.bcrypt.genSalt(this.saltRounds, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          accept(salt);
        }
      });
    }).then((accept, reject, salt) => {
      this.bcrypt.hash(inputPassword, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          accept(hash);
        }
      });
    }).done((salt, hash) => hash);
  }
}

const bcrypt = require('bcrypt');
module.exports = new PasswordHelper(bcrypt);
