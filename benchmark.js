const { generateKeyPairSync, createSign, createVerify } = require('crypto');
const { performance } = require('perf_hooks');

function benchmarkECDSA(iterations = 1000) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'secp256k1'
  });
  const message = Buffer.from('hello world');

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const sign = createSign('SHA256');
    sign.update(message);
    sign.end();
    const signature = sign.sign(privateKey);

    const verify = createVerify('SHA256');
    verify.update(message);
    verify.end();
    verify.verify(publicKey, signature);
  }
  const end = performance.now();
  return end - start;
}

function benchmarkDilithium(iterations = 1000) {
  // Dilithium implementation not available, simulate using repeated hashing
  const { createHash } = require('crypto');
  const message = Buffer.from('hello world');

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    let buf = message;
    for (let j = 0; j < 100; j++) {
      buf = createHash('sha256').update(buf).digest();
    }
  }
  const end = performance.now();
  return end - start;
}

function run() {
  const iterations = parseInt(process.argv[2]) || 1000;
  const ecdsaTime = benchmarkECDSA(iterations);
  const dilithiumTime = benchmarkDilithium(iterations);
  console.log(`Iterations: ${iterations}`);
  console.log(`ECDSA time: ${ecdsaTime.toFixed(2)} ms`);
  console.log(`Dilithium simulated time: ${dilithiumTime.toFixed(2)} ms`);
}

if (require.main === module) {
  run();
}
