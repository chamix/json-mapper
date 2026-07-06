import { test } from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';
import { StreamReaderAdapter } from '../../src/adapters/repositories/StreamReaderAdapter.js';

test('StreamReaderAdapter - reads valid JSON array from readable stream', async () => {
  const adapter = new StreamReaderAdapter();
  const data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
  const stream = Readable.from(JSON.stringify(data));

  const result = await adapter.readJson(stream);
  assert.deepEqual(result, data);
});

test('StreamReaderAdapter - throws descriptive error when stream is empty', async () => {
  const adapter = new StreamReaderAdapter();
  const stream = Readable.from('');

  await assert.rejects(
    () => adapter.readJson(stream),
    /Input stream is empty/
  );
});

test('StreamReaderAdapter - throws SyntaxError/Error on malformed JSON content', async () => {
  const adapter = new StreamReaderAdapter();
  const stream = Readable.from('[{ invalid json: true }');

  await assert.rejects(
    () => adapter.readJson(stream),
    SyntaxError
  );
});
