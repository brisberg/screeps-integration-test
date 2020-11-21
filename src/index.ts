import {ScreepsTestServer} from '@brisberg/screeps-test-server';
import {
  LOCKSTEP_LOCKED,
  LOCKSTEP_UNLOCK,
} from '@brisberg/screepsmod-lockstep/lib/constants';
import path from 'path';
import q from 'q';


interface ScreepsIntegrationTestOptions {
  silent?: boolean;
  steamApiKey?: string;
  serverDir?: string;
  mods?: string[];
  bots?: string[];
}

/**
 * Specialized Screeps Test Server with fine-grained control of ticks.
 */
export default class ScreepsIntegrationTest extends ScreepsTestServer {
  private _tickSubscribed: boolean;
  private tickDefer: q.Deferred<number>|null;

  constructor(opts: ScreepsIntegrationTestOptions = {}) {
    // Add screepsmod-lockstep to server mods
    const lockstepModPath = path.join(
        process.cwd(),
        'node_modules/@brisberg/screepsmod-lockstep/lib/index.js',
    );
    const mods = [
      ...opts.mods || [],
      lockstepModPath,
    ];
    super({...opts, mods});

    // Private flag indicating if we have subscribed to the 'lock' event yet
    // Must do so after the connected
    this._tickSubscribed = false;
    this.tickDefer = null;
  }

  async start(): Promise<void> {
    await super.start();

    if (!this._tickSubscribed) {
      // Subscribe to locked event to resolve ticks
      // Only need to subscribe once
      this.pubsub.subscribe(LOCKSTEP_LOCKED, (gameTime: number) => {
        if (this.tickDefer) {
          this.tickDefer.resolve(gameTime);
        }
      });
      this._tickSubscribed = true;
    }
  }

  async tick(tickCount = 1): Promise<void> {
    if (!this.connected) {
      throw new Error(
          'Test Server disconnected. Must call start() before tick().');
    }
    await this.pubsub.publish(LOCKSTEP_UNLOCK, tickCount);
    this.tickDefer = q.defer();
    await this.tickDefer.promise;
  }

  async stop(): Promise<void> {
    await super.stop();

    this.tickDefer = null;
  }
}
