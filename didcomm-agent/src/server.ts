import express from 'express';
import bodyParser from 'body-parser';
import { Message } from 'didcomm';
import { v4 as uuidv4 } from 'uuid';
import {
  ALICE_DID,
  BOB_DID,
  ALICE_DID_DOC,
  BOB_DID_DOC,
  ALICE_SECRETS,
  BOB_SECRETS,
  ExampleDIDResolver,
  ExampleSecretsResolver,
} from './agents.js';

const app = express();
app.use(bodyParser.json());

const invitations = new Map<string, string>();
const messages: Record<string, string[]> = {};

function addMessage(recipient: string, msg: string) {
  if (!messages[recipient]) messages[recipient] = [];
  messages[recipient].push(msg);
}

app.post('/invite', async (req, res) => {
  const id = uuidv4();
  const invitation = new Message({
    id,
    typ: 'application/didcomm-plain+json',
    type: 'https://didcomm.org/invite/1.0/invitation',
    from: ALICE_DID,
    to: [BOB_DID],
    body: { greeting: 'Hi Bob, please connect!' },
  });

  const didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
  const secretsResolver = new ExampleSecretsResolver(ALICE_SECRETS);
  const [packed] = await invitation.pack_encrypted(
    BOB_DID,
    ALICE_DID,
    null,
    didResolver,
    secretsResolver,
    { forward: false }
  );

  invitations.set(id, packed);
  res.json({ inviteId: id, invitation: packed });
});

app.post('/accept', async (req, res) => {
  const { inviteId } = req.body as { inviteId: string };
  const packed = invitations.get(inviteId);
  if (!packed) return res.status(404).send('Invite not found');

  const didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
  const secretsResolver = new ExampleSecretsResolver(BOB_SECRETS);
  const [unpacked] = await Message.unpack(packed!, didResolver, secretsResolver, {});

  const handshake = new Message({
    id: uuidv4(),
    typ: 'application/didcomm-plain+json',
    type: 'https://didcomm.org/invite/1.0/handshake',
    from: BOB_DID,
    to: [ALICE_DID],
    body: { response: 'accepted', original: unpacked.as_value() },
  });

  const [respPacked] = await handshake.pack_encrypted(
    ALICE_DID,
    BOB_DID,
    null,
    didResolver,
    new ExampleSecretsResolver(BOB_SECRETS),
    { forward: false }
  );

  addMessage(ALICE_DID, respPacked);
  res.json({ handshake: respPacked });
});

app.post('/send', async (req, res) => {
  const { from, to, body } = req.body as { from: string; to: string; body: any };
  const didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
  const secretsResolver = new ExampleSecretsResolver(
    from === ALICE_DID ? ALICE_SECRETS : BOB_SECRETS
  );

  const msg = new Message({
    id: uuidv4(),
    typ: 'application/didcomm-plain+json',
    type: 'https://didcomm.org/message/1.0',
    from,
    to: [to],
    body,
  });

  const [packed] = await msg.pack_encrypted(to, from, null, didResolver, secretsResolver, {
    forward: false,
  });

  addMessage(to, packed);
  res.json({ packed });
});

app.get('/messages/:did', (req, res) => {
  const did = req.params.did;
  res.json({ messages: messages[did] || [] });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`DIDComm agent listening on ${port}`));
