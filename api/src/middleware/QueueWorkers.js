'use strict';
const AWS = require('aws-sdk');
const config = require('config/server');
const Producer = require('sqs-producer');
const Sequence = require('impossible-promise');


const sqs = new AWS.SQS({
  endpoint: config.aws.sqs.endpoint,
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey,
  logger: console.info,
  region: 'eu-west-1',
  sslEnabled: true,
  waitTimeSeconds: 1,
});

class QueueWorkers {

  static endpoint() {
    return config.aws.sqs.endpoint;
  }

  static producer(queue) {
    return Producer.create({
      sqs: QueueWorkers.sqs(),
      queueUrl: QueueWorkers.queueUrl(queue)
    });
  }

  static sqs() {
    return sqs;
  }

  static queueName(queue) {
    // queue prefix + queue name + env
    return ['gnome', queue, (process.env.GNOME_ENV || 'dev')].join('-');
  }

  static queueUrl(queue) {
    return config.aws.sqs.endpoint + QueueWorkers.queueName(queue);
  }

  static publish(queue, type, data) {
    console.log("QueueWorkers:", type, 'to', QueueWorkers.queueName(queue), 'with', data);

    let msg = { type, data }
    let queueUrl = QueueWorkers.queueUrl(queue)

    return new Sequence((accept, reject) => {
      accept(QueueWorkers.producer(queue))
    }).then((accept, reject, producer) => {
      producer.send({
        id: [type, Math.round(Math.random()*1000)].join("_"),
        body: JSON.stringify(msg)
      }, (err)=> {
        if (err) return reject(err);
        accept(msg)
      });
    }).error(e => console.error('QueueWorkers@publish could not send msg', e))
      .done(() => true)

  }

  static activity(type, data) {
    return QueueWorkers.publish('activity', type, data)
  }

  static email(type, data) {
    return QueueWorkers.publish('email', type, data)
  }

  static notification(type, data) {
    return QueueWorkers.publish('notification', type, data)
  }

}

module.exports = QueueWorkers;
