
import { Hasher, WasmDigestAlgorithms, toHashEncodinegType } from './Hasher.ts';
import {
  toHashString
} from './deps/std.ts';

export class HashTransformer implements Transformer<Uint8Array, Uint8Array> {
  hasher: Hasher;

  constructor (
    algorithm: WasmDigestAlgorithms
  ) {
    this.hasher = new Hasher(algorithm);
  }

  start() {}

  transform (chunk: Uint8Array, collector: TransformStreamDefaultController<Uint8Array>) {
    this.hasher.update(chunk);
    collector.enqueue(chunk);
  }
}

/**
 * Hasher in TransformStream
 * @example
 * ```typescript
 * const response = await fetch('URL');
 * const fileTo = Deno.opne('./example.txt', { create: true, write: true });
 * const hasher = HashTransformStream = new HashTransformStream('SHA-256')
 * 
 * await response.body!
 *   .pipeThrough(hasher)
 *   .pipeTo(fileTo.writable);
 * 
 * hasher.digest('hex') // -> string
 * ```
 */
export class HashTransformStream extends TransformStream {
  transformer: HashTransformer;
  constructor (algorithm: WasmDigestAlgorithms) {
    const transformer = new HashTransformer(algorithm);
    super(
      transformer
    );

    this.transformer = transformer;
  }

  digest (): Uint8Array;
  digest (encoding: toHashEncodinegType): string;
  digest (encoding?: toHashEncodinegType) {
    if (encoding) {
      return this.transformer.hasher.digest(encoding);
    } else {
      return this.transformer.hasher.digest();
    }
  }

  digestWithHex () {
    return toHashString(this.transformer.hasher.digest());
  }
}
