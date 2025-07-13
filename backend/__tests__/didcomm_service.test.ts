import { strict as assert } from 'assert';
import { DIDCommService } from '../src/didcomm/didcomm_service';

class StubDIDComm {
  async packEncrypted(message: any) {
    return { packed_msg: JSON.stringify(message) };
  }

  async unpackMessage(packed: string) {
    return JSON.parse(packed);
  }
}

(async () => {
  const service = new DIDCommService(new StubDIDComm() as any);
  const msg = { id: '1', body: { hello: 'world' } };
  const packed = await service['didcomm'].packEncrypted(msg);
  const unpacked = await service.receiveMessage(packed.packed_msg);
  assert.deepEqual(unpacked, msg);
  console.log('didcomm_service test passed');
})();
