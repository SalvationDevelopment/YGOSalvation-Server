import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const target = new URL('./chanserv.js', import.meta.url);

test('chanserv.js is present with contents', async () => {
  const contents = await readFile(target, 'utf8');
  assert.notEqual(contents.trim().length, 0);
});
