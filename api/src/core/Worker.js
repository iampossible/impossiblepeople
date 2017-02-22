'use strict';

const QueueWorkers = require('middleware/QueueWorkers');
const Consumer = require('sqs-consumer');

class Worker {

  sqs() {
    return QueueWorkers.sqs();
  }

  constructor(queue) {
    this.ev = {};
    this.num = Math.random();
    this.queue = QueueWorkers.queueName(queue);

    this.sqs().createQueue({ QueueName: this.queue }, (err) => {
      if (err) console.warn('Could not create', this.queue);
    });

    this.consumer = new Consumer.create({
      sqs: this.sqs(),
      queueUrl: QueueWorkers.queueUrl(queue),
      handleMessage: this._onMessage.bind(this),
      waitTimeSeconds: 1,
    }).on('error', (e) => {
      if (e.constructor.name === 'SQSError') {
        console.error('SQS Consumer Error:', e.message)
      } else {
        console.error('SQS Error:', e)
      }
    })

  }

  _onMessage(message, acknowledge) {
    var msgBody;
    var msgID;
    var msgType;
    console.log(this.constructor.name, 'received', JSON.stringify(message));
    try {
      msgBody = JSON.parse(message.Body);
      msgID = message.MessageId;
      msgType = msgBody.type;
    } catch (e) {
      console.error('could not read msg:', e);
      return acknowledge(); // NOTE: use acknowledge(Error) to send the msg to dead letter queue
    }

    if (this.ev.hasOwnProperty(msgType)) {
      this.ev[msgType].forEach((listener) => {
        if (listener instanceof Function) {
          console.log(this.constructor.name, 'forwarding', msgID, 'to', listener.name || 'anonymous function');
          try {
            listener(msgBody, msgID);
          } catch (e) {
            console.error('could not process msg:', e); 
          }
        }
      });
    }

    return acknowledge();
  }

  start() {
    return new Promise((accept, reject) => {
      this.consumer.start();
      if (this.consumer.stopped) {
        return reject(this.constructor.name, 'FAILED TO START');
      }
      return accept(this.consumer);
    });
  }

  stop() {
    this.consumer.stop();
    return Promise.resolve(this.consumer);
  }

  on(msgType, callback) {
    if (!(this.ev.hasOwnProperty(msgType))) {
      this.ev[msgType] = [];
    }

    this.ev[msgType].push(callback);
  }

  once(msgType, callback) {
    if (!(this.ev.hasOwnProperty(msgType))) {
      this.ev[msgType] = [];
    }
    var index = this.ev[msgType].length;
    this.ev[msgType].push((msg, msgID) => {
      callback(msg, msgID);
      this.ev[msgType][index] = null;
    });
  }

}

module.exports = Worker;
