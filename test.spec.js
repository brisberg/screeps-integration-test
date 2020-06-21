const ScreepsIntegrationTest = require('./index');

describe('Screeps Integration Test', () => {
  let server;

  beforeEach(() => {
    server = new ScreepsIntegrationTest();
  });

  afterEach(async () => {
    await server.stop();
    server = undefined;
  });

  it.todo('should throw an error if tick() is called before start()');

  describe('when server started', () => {
    beforeEach(async () => {
      await server.start();
      server.pubsub.publish('setTickRate', 100);  // 10 tick/sec
    });

    it('should progress one tick when calling tick()', async () => {
      const {env} = server;
      const startTime = await env.get(env.keys.GAMETIME);

      await server.tick();

      const endTime = await env.get(env.keys.GAMETIME);
      expect(endTime).toEqual(startTime + 1);
    });

    it('should progress N ticks when calling tick(N)', async () => {
      const {env} = server;
      const startTime = await env.get(env.keys.GAMETIME);

      await server.tick(5);

      const endTime = await env.get(env.keys.GAMETIME);
      expect(endTime).toEqual(startTime + 5);
    });
  });
});
