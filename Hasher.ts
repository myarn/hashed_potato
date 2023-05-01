import {
  wasmDigestAlgorithms,
  instantiateWasm
} from './deps/std.ts';

export type WasmDigestAlgorithms = typeof wasmDigestAlgorithms[number];

export class Hasher {
  context: InstanceType<ReturnType<typeof instantiateWasm>['DigestContext']>

  constructor (
    _algorithm: WasmDigestAlgorithms
  ) {
    const algorithm = _algorithm.toUpperCase();

    const wasmCrypto = instantiateWasm();
    this.context = new wasmCrypto.DigestContext(algorithm);
  }

  update (_data: Uint8Array): void;
  update (_data: ReadableStream<Uint8Array>): Promise<void>;
  update (_data: Uint8Array | ReadableStream<Uint8Array>) {
    if (_data instanceof Uint8Array) {
      this.context.update(_data);
    } else if (_data instanceof ReadableStream) {
      return new Promise<void>(async (resolve, reject) => {
        const reader = _data.getReader();

        while (true) {
          const {value, done} = await reader.read();

          if (done) break;

          this.update(value)
        }

        reader.releaseLock();
        resolve();
      });
    }
  }

  digest () {
    return this.context.digestAndDrop(undefined);
  }
}
