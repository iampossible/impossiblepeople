'use strict';

class Overseer {
  constructor() {
    this.workers = [];
  }

  load(workerName, options) {
    let Instance = require(`workers/${workerName}`);
    this.workers.push((new Instance(options)));
  }

  start() { 
    return Promise.all(this.workers.map(worker => worker.start()));
  }

  get(name) {
    return this.workers.find((instance) => {
      return (instance.constructor.name === name);
    }) 
  }

}


module.exports = Overseer;
