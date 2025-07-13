import type { PlaintextMessage, EncryptedMessage } from '@credo-ts/didcomm'
import { Agent, getDefaultDidcommModules, EnvelopeService } from '@credo-ts/didcomm'
import { agentDependencies } from '@credo-ts/node'

export interface DidCommV2EnvelopeKeys {
  recipientKeys: string[]
  routingKeys?: string[]
  senderKey?: string
}

/**
 * Pack a DIDComm v2 message using Aries-Framework-JS.
 * This sets up a temporary agent and uses the EnvelopeService
 * to create a DIDComm v2 JWE envelope.
 */
export async function packDidCommV2Message(
  message: PlaintextMessage,
  keys: DidCommV2EnvelopeKeys
): Promise<EncryptedMessage> {
  const agent = new Agent({
    config: { label: 'didcomm-v2-helper' },
    dependencies: agentDependencies,
    modules: getDefaultDidcommModules(),
  })

  await agent.initialize()

  const envelopeService = agent.dependencyManager.resolve(EnvelopeService)
  const encrypted = await envelopeService.packMessage(agent.context, message, {
    recipientKeys: keys.recipientKeys.map((key) => ({ kid: key } as any)),
    routingKeys: (keys.routingKeys ?? []).map((key) => ({ kid: key } as any)),
    senderKey: keys.senderKey ? ({ kid: keys.senderKey } as any) : null,
  })

  await agent.shutdown()
  return encrypted
}

/**
 * Unpack a DIDComm v2 message using Aries-Framework-JS.
 * The function creates a temporary agent to decrypt the envelope.
 */
export async function unpackDidCommV2Message(
  envelope: EncryptedMessage,
  keys: DidCommV2EnvelopeKeys
): Promise<PlaintextMessage> {
  const agent = new Agent({
    config: { label: 'didcomm-v2-helper' },
    dependencies: agentDependencies,
    modules: getDefaultDidcommModules(),
  })

  await agent.initialize()

  const envelopeService = agent.dependencyManager.resolve(EnvelopeService)
  const decrypted = await envelopeService.unpackMessage(agent.context, envelope)

  await agent.shutdown()
  return decrypted.plaintextMessage
}
