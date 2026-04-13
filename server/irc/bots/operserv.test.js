import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const target = new URL('./operserv.js', import.meta.url);

test('operserv.js is present with contents', async () => {
  const contents = await readFile(target, 'utf8');
  assert.notEqual(contents.trim().length, 0);
});
