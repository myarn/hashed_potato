import {
  wasmDigestAlgorithms,
  instantiateWasm,
  toHashString
} from './deps/std.ts';

export type WasmDigestAlgorithms = typeof wasmDigestAlgorithms[number];
export type toHashEncodinegType = Parameters<typeof toHashString>[1];

/**
 * Generic hashing class
 * @example Basic usage
 * ```typescript
 * import { Hasher } from 'https://raw.githubusercontent.com/myarn/hashed_potato/0.0.1/mod.ts';
 * 
 * const hasher = new Hasher('SHA-256');
 * const image = await Deno.open(TESTFILE_PATH, {
 *   read: true
 * });
 * 
 * const reader = image.readable.getReader();
 * 
 * while (true) {
 *   const { value, done } = await reader.read();
 * 
 *   if (done) break;
 * 
 *   hasher.update(value);
 * }
 * 
 * const hash = hasher.digest('hex');
 * ```
 * 
 * @example Simple usage
 * ```typescript
 *   const hasher = new Hasher('SHA-256');
 * const image = await Deno.open(TESTFILE_PATH, {
 *   read: true
 * });
 * 
 * await hasher.updateByReadableStream(image.readable);
 * 
 * const hash = hasher.digest('hex');
 * ```
 */
export class Hasher {
  context: InstanceType<ReturnType<typeof instantiateWasm>['DigestContext']>

  constructor (
    _algorithm: WasmDigestAlgorithms
  ) {
    const algorithm = _algorithm.toUpperCase();

    const wasmCrypto = instantiateWasm();
    this.context = new wasmCrypto.DigestContext(algorithm);
  }

  update (data: Uint8Array) {
    this.context.update(data);
  }

  /**
   * Update with ReadbleStream\<Unit8Array\>
   * @example 
   * ```typescript
   * const hasher = new Hasher('SHA-256');
   * const image = await Deno.open(TESTFILE_PATH, {
   *   read: true
   * });
   * 
   * await hasher.updateByReadableStream(image.readable);
   * 
   * const hash = hasher.digest('hex');
   * ```
   */
  async updateByReadableStream (data: ReadableStream<Uint8Array>): Promise<void> {
      const reader = data.getReader();

      while (true) {
        const {value, done} = await reader.read();

        if (done) break;

        this.update(value);
      }

      reader.releaseLock();
  }

  /**
   * Digest hash
   * @example Digest in Unit8Array
   * ```typescript
   * const hasher = new Hasher('SHA-256');
   * const image = await Deno.open(TESTFILE_PATH, {
   *   read: true
   * });
   * 
   * await hasher.updateByReadableStream(image.readable);
   * 
   * const hash = hasher.digest(); // -> Unit8Array
   * ```
   * 
   * @example Digest in Hex
   * ```typescript
   * const hasher = new Hasher('SHA-256');
   * const image = await Deno.open(TESTFILE_PATH, {
   *   read: true
   * });
   * 
   * await hasher.updateByReadableStream(image.readable);
   * 
   * const hash = hasher.digest('hex'); // -> string
   * ```
   */
  digest (): Uint8Array;
  digest (encoding: toHashEncodinegType): string;
  digest (encoding?: toHashEncodinegType) {
    const result = this.context.digestAndDrop(undefined);
    if (encoding) {
      return toHashString(result, encoding);
    } else {
      return result;
    }
  }
}
