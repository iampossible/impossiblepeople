'use strict';


const QueueWorkers = require('middleware/QueueWorkers');
const Config = require('config/server');

describe('QueueWorkers middleware', () => {
  var fakeProducer = { send: jasmine.createSpy() };
  beforeEach(() => {
    spyOn(QueueWorkers, 'producer').and.callFake((q) => {
      console.log("FAKE PRODUCER FOR", q)
      return fakeProducer;
    });
  })

  it('should have a static connection to SQS', () => {
    let sqs = QueueWorkers.sqs();
    expect(sqs.config.accessKeyId).toBe(Config.aws.accessKey);
  });

  it('should generate prefixed and sufixed queue names', () => {
    let queueName = QueueWorkers.queueName('queue');
    expect(queueName).toBe('gnome-queue-'+process.env.GNOME_ENV);
  });

  it('should generate queue URL', () => {
    let queueUrl = QueueWorkers.queueUrl('queue');
    expect(queueUrl).toBe(Config.aws.sqs.endpoint + 'gnome-queue-'+process.env.GNOME_ENV);
  });


  it('should publish the message to SQS on .publish()', () => {
    spyOn(QueueWorkers, 'publish').and.callThrough();

    QueueWorkers.publish('lalala', 'TEST_EVENT', { foo: 'bar' }).done(() => {
      expect(QueueWorkers.publish).toHaveBeenCalledWith('lalala', 'TEST_EVENT', { foo: 'bar' });
      expect(QueueWorkers.producer).toHaveBeenCalledWith('lalala');

      expect(fakeProducer.send).toHaveBeenCalledWith(jasmine.any(Object));
    });
  });

  it('should publish to the activity feed on .activity()', () => {
    spyOn(QueueWorkers, 'publish');

    QueueWorkers.activity('TEST_ACTIVITY_EVENT', { foo: 'bar' });
    expect(QueueWorkers.publish).toHaveBeenCalledWith('activity', 'TEST_ACTIVITY_EVENT', { foo: 'bar' });
  });

  it('should publish to the activity feed on .email()', () => {
    spyOn(QueueWorkers, 'publish');

    QueueWorkers.email('TEST_EMAIL_EVENT', { foo: 'bar' });
    expect(QueueWorkers.publish).toHaveBeenCalledWith('email', 'TEST_EMAIL_EVENT', { foo: 'bar' });
  });

  it('should publish to the notification feed on .notification()', () => {
    spyOn(QueueWorkers, 'publish');

    QueueWorkers.notification('TEST_NOTIFICATION_EVENT', { foo: 'bar' });
    expect(QueueWorkers.publish).toHaveBeenCalledWith('notification', 'TEST_NOTIFICATION_EVENT', { foo: 'bar' });
  });
});
