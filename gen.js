const { EventEmitter } = require('events')

class Updater extends EventEmitter {
  async run(rounds = 100) {
    for(let i = 0; i < rounds; i++) {
      await timeout(3e3)
      this.emit('update', { number: i })
    }
  }
}


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = Updater