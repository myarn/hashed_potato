import {
  assertEquals
} from 'https://deno.land/std@0.185.0/testing/asserts.ts';
import { Hasher } from '../Hasher.ts';

const TESTFILE_PATH = './test/mycat.jpg';
const TESHFILE_HASH = '71731620ecd7e52011405c8249e130b70386a128d9818abaeab8989bb37b37cc';

Deno.test('Digest from Unit8Array',async () => {
  const hasher = new Hasher('SHA-256');
  const image = await Deno.open(TESTFILE_PATH, {
    read: true
  });

  const reader = image.readable.getReader();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    hasher.update(value);
  }

  assertEquals(hasher.digest('hex'), TESHFILE_HASH);
});

Deno.test('Digest from ReadableStream<Unit8Array>',async () => {
  const hasher = new Hasher('SHA-256');
  const image = await Deno.open(TESTFILE_PATH, {
    read: true
  });

  await hasher.update(image.readable);

  assertEquals(hasher.digest('hex'), TESHFILE_HASH);
});
