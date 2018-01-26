'use strict';

const crypto = require('crypto');
const Sequence = require('impossible-promise');
const Model = require('core/Model');

const config = require('config/server');

const cipherAlgo = 'aes256';

class NewsletterModel extends Model {
  unsubscribe(code) {
    return new Sequence((accept, reject) => {

      try {

        const d = crypto.createDecipher(cipherAlgo, config.settings.newsletter_key);

        let raw = d.update(code, 'hex', 'utf8');
        raw += d.final('utf8');

        const codeParts = raw.split(';');
        if (codeParts.length === 3) {
          const userID = codeParts[0];
          const userEmail = codeParts[1];
          const timestamp = codeParts[2];
          // console.log(userID, userEmail, timestamp, Date.now().valueOf());

          if (parseInt(timestamp, 10) < Date.now().valueOf()) {
            this.db.getOne(
              `MATCH (p:Person)
              WHERE  
                ({email} IS NOT NULL AND p.email = {email})
                AND ({userID} IS NOT NULL AND p.userID = {userID})
              SET
                p.mailUnsubscribe = true
              RETURN p`,
              {
                email: userEmail,
                userID
              }
            ).done((user) => {
              if (user) {
                accept(`${userEmail} has been unsubscribed.`);
              } else {
                reject({ msg: 'Not found', code: 400 });
              }
            }).error(reject);
          } else {
            reject({ msg: 'Invalid timestamp', code: 400 });
          }
        } else {
          reject({ msg: 'Invalid code', code: 400 });
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = new NewsletterModel();
