import {
  wasmDigestAlgorithms,
  instantiateWasm,
  toHashString
} from './deps/std.ts';

export type WasmDigestAlgorithms = typeof wasmDigestAlgorithms[number];
export type toHashEncodinegType = Parameters<typeof toHashString>[1];

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

  async updateByReadableStream (data: ReadableStream<Uint8Array>): Promise<void> {
      const reader = data.getReader();

      while (true) {
        const {value, done} = await reader.read();

        if (done) break;

        this.update(value);
      }

      reader.releaseLock();
  }

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
