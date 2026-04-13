import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const target = new URL('./memoserv.js', import.meta.url);

test('memoserv.js is present with contents', async () => {
  const contents = await readFile(target, 'utf8');
  assert.notEqual(contents.trim().length, 0);
});
