import {
  assertEquals
} from 'https://deno.land/std@0.185.0/testing/asserts.ts';
import { HashTransformStream } from '../HashTransformStream.ts';

const TESTFILE_PATH = './test/mycat.jpg';
const TESTFILE_COPY_PATH = './test/mycat.copy.jpg';
const TESHFILE_HASH = '71731620ecd7e52011405c8249e130b70386a128d9818abaeab8989bb37b37cc';

Deno.test('Digest from Unit8Array',async () => {
  const hashTransformeStream = new HashTransformStream('SHA-256');
  const imageFrom = await Deno.open(TESTFILE_PATH, {
    read: true
  });

  const imageTo = await Deno.open(TESTFILE_COPY_PATH, {
    write: true,
    create: true
  });

  await imageFrom.readable
    .pipeThrough(hashTransformeStream)
    .pipeTo(imageTo.writable);

  const result = hashTransformeStream.digest('hex');

  assertEquals(result, TESHFILE_HASH);

  await Deno.remove(TESTFILE_COPY_PATH);
});
