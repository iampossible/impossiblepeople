'use strict';

const Worker = require('core/Worker');

class TestWorker extends Worker {
  constructor() {
    super('test');

    this.on('TEST_EVENT', this.onTest);
  }

  onTest(msg, id){
    console.log(id, 'with', msg);
  }

}


module.exports = TestWorker;
