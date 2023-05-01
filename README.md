# Hashed potato 
Hashed potato is Hash Utility

## Example
### Hasher in TransformStream

```typescript
const response = await fetch('URL');
const fileTo = Deno.opne('./example.txt', { create: true, write: true });
const hasher = HashTransformStream = new HashTransformStream('SHA-256')

await response.body!
  .pipeThrough(hasher)
  .pipeTo(fileTo.writable);

hasher.digest('hex') // -> string
```

### Update with ReadableStream<Unit8Array>

```typescript
const hasher = new Hasher('SHA-256');
const image = await Deno.open(TESTFILE_PATH, {
  read: true
});

await hasher.updateByReadableStream(image.readable);

hasher.digest('hex'); // -> string
```
