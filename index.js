const {ScreepsTestServer} = require('@brisberg/screeps-test-server');
const path = require('path');
const q = require('q');
const {
  LOCKSTEP_UNLOCK,
  LOCKSTEP_LOCKED,
} = require('@brisberg/screepsmod-lockstep/constants');

/**
 * Specialized Screeps Test Server with fine-grained control of ticks.
 */
class ScreepsIntegrationTest extends ScreepsTestServer {
  constructor(opts) {
    // Add screepsmod-lockstep to server mods
    const lockstepModPath = path.join(
        __dirname,
        'node_modules/@brisberg/screepsmod-lockstep/index.js',
    );
    const mods = [
      ...opts.mods,
      lockstepModPath,
    ];
    super({...opts, mods});

    // Subscribe to locked event to resolve ticks
    this.pubsub.subscribe(LOCKSTEP_LOCKED, (gameTime) => {
      if (this.tickDefer) {
        this.tickDefer.resolve(gameTime);
      }
    });
  }

  async tick(tickCount = 1) {
    if (this.connected) {
      await this.pubsub.publish(LOCKSTEP_UNLOCK, tickCount);
      this.tickDefer = q.defer();
      await this.tickDefer.promise;
    }
  }
}

module.exports = ScreepsIntegrationTest;
