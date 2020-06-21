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
  constructor(opts = {}) {
    // Add screepsmod-lockstep to server mods
    const lockstepModPath = path.join(
        __dirname,
        'node_modules/@brisberg/screepsmod-lockstep/index.js',
    );
    const mods = [
      ...opts.mods || [],
      lockstepModPath,
    ];
    super({...opts, mods});

    // Private flag indicating if we have subscribed to the 'lock' event yet
    // Must do so after the connected
    this._tickSubscribed = false;
  }

  async start() {
    await super.start();

    if (!this._tickSubscribed) {
      // Subscribe to locked event to resolve ticks
      // Only need to subscribe once
      this.pubsub.subscribe(LOCKSTEP_LOCKED, (gameTime) => {
        if (this.tickDefer) {
          this.tickDefer.resolve(gameTime);
        }
      });
      this._tickSubscribed = true;
    }
  }

  async tick(tickCount = 1) {
    if (!this.connected) {
      throw new Error(
          'Test Server disconnected. Must call start() before tick().')
    }
    await this.pubsub.publish(LOCKSTEP_UNLOCK, tickCount);
    this.tickDefer = q.defer();
    await this.tickDefer.promise;
  }

  async stop() {
    await super.stop();

    this.tickDefer = undefined;
  }
}

module.exports = ScreepsIntegrationTest;
