import fetch from 'node-fetch';
import { DIDComm, Message } from 'didcomm';

export class DIDCommService {
  private didcomm: DIDComm;

  constructor(didcomm: DIDComm) {
    this.didcomm = didcomm;
  }

  /**
   * Send a DIDComm v2 message to the recipient's service endpoint.
   * This packs the message using authenticated encryption and posts it
   * to the provided HTTP endpoint.
   */
  async sendMessage(message: Message, serviceEndpoint: string): Promise<void> {
    const packed = await this.didcomm.packEncrypted(
      message,
      undefined,
      undefined
    );

    await fetch(serviceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/didcomm-envelope-enc'
      },
      body: packed.packed_msg
    });
  }

  /**
   * Unpacks an incoming DIDComm v2 message.
   */
  async receiveMessage(packedMessage: string) {
    return this.didcomm.unpackMessage(packedMessage);
  }
}
