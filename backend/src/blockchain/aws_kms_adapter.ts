import { KMSClient, SignCommand } from "@aws-sdk/client-kms";

export class AwsKmsSigner {
  private kmsClient: KMSClient;
  private keyId: string;

  constructor(region: string, keyId: string) {
    this.kmsClient = new KMSClient({ region });
    this.keyId = keyId;
  }

  /**
   * Sign a buffer of data using AWS KMS
   * @param data Buffer containing data to sign
   * @returns Signature as Buffer
   */
  async sign(data: Buffer): Promise<Buffer> {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: data,
      MessageType: "RAW",
      SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA256",
    });
    const response = await this.kmsClient.send(command);
    if (!response.Signature) {
      throw new Error("KMS did not return a signature");
    }
    return Buffer.from(response.Signature as Uint8Array);
  }
}
