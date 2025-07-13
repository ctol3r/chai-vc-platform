import asyncio
import json
from didcomm.message import Message
from didcomm.pack_encrypted import pack_encrypted
from didcomm.unpack import unpack
from didcomm.common.resolvers import ResolversConfig
from didcomm.secrets.secrets_resolver_in_memory import SecretsResolverInMemory
from didcomm.did_doc.did_resolver_in_memory import DIDResolverInMemory
from didcomm.secrets.secrets_resolver import Secret
from didcomm.secrets.secrets_util import generate_x25519_keys_as_jwk_dict
from didcomm.common.types import (
    VerificationMaterial,
    VerificationMaterialFormat,
    VerificationMethodType,
)
from didcomm.did_doc.did_doc import DIDDoc, VerificationMethod


def test_didcomm_encrypted_offer():
    asyncio.run(_test_async())


async def _test_async():
    alice_priv, alice_pub = generate_x25519_keys_as_jwk_dict()
    bob_priv, bob_pub = generate_x25519_keys_as_jwk_dict()

    alice_vm = VerificationMethod(
        id="did:example:alice#key-1",
        type=VerificationMethodType.JSON_WEB_KEY_2020,
        controller="did:example:alice",
        verification_material=VerificationMaterial(
            VerificationMaterialFormat.JWK, json.dumps(alice_pub)
        ),
    )
    bob_vm = VerificationMethod(
        id="did:example:bob#key-1",
        type=VerificationMethodType.JSON_WEB_KEY_2020,
        controller="did:example:bob",
        verification_material=VerificationMaterial(
            VerificationMaterialFormat.JWK, json.dumps(bob_pub)
        ),
    )

    alice_secret = Secret(
        kid=alice_vm.id,
        type=VerificationMethodType.JSON_WEB_KEY_2020,
        verification_material=VerificationMaterial(
            VerificationMaterialFormat.JWK, json.dumps(alice_priv)
        ),
    )
    bob_secret = Secret(
        kid=bob_vm.id,
        type=VerificationMethodType.JSON_WEB_KEY_2020,
        verification_material=VerificationMaterial(
            VerificationMaterialFormat.JWK, json.dumps(bob_priv)
        ),
    )

    alice_doc = DIDDoc(
        did="did:example:alice",
        key_agreement_kids=[alice_vm.id],
        authentication_kids=[],
        verification_methods=[alice_vm],
        didcomm_services=[],
    )
    bob_doc = DIDDoc(
        did="did:example:bob",
        key_agreement_kids=[bob_vm.id],
        authentication_kids=[],
        verification_methods=[bob_vm],
        didcomm_services=[],
    )

    secrets_resolver = SecretsResolverInMemory([alice_secret, bob_secret])
    did_resolver = DIDResolverInMemory([alice_doc, bob_doc])
    resolvers_config = ResolversConfig(secrets_resolver, did_resolver)

    offer = Message(
        id="1",
        type="https://didcomm.org/issue-credential/3.0/offer-credential",
        body={"credential": "nursing-license"},
    )

    packed = await pack_encrypted(
        resolvers_config=resolvers_config,
        message=offer,
        to="did:example:bob",
        frm="did:example:alice",
    )

    unpacked = await unpack(resolvers_config, packed.packed_msg)

    assert unpacked.message.body == offer.body
    assert unpacked.message.type == offer.type
    assert unpacked.metadata.encrypted
    assert unpacked.metadata.encrypted_from == packed.from_kid
    assert unpacked.metadata.encrypted_to == packed.to_kids

