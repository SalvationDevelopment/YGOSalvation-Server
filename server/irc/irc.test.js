import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

test('irc boot script invokes IRC.boot()', async (t) => {
  t.after(() => mock.restoreAll());

  const boot = mock.fn(() => undefined);
  await mock.module('./services/irc/server.js', { defaultExport: { boot } });

  await import('./irc.js?' + Math.random());

  assert.equal(boot.mock.callCount(), 1);
});

