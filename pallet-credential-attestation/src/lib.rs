//! A simple credential attestation pallet stub for chai-vc-platform.
//!
//! This library exposes basic functions to link verifiable credential
//! (VC) hashes to multiple issuer DIDs. It is not intended to be a
//! fully functional Substrate pallet but models the storage and logic
//! that such a pallet would contain.

use sp_core::H256;
use std::collections::{BTreeMap, BTreeSet};

/// Storage representation mapping a VC hash to a set of issuer DIDs.
#[derive(Default)]
pub struct CredentialAttestations {
    map: BTreeMap<H256, BTreeSet<Vec<u8>>>,
}

impl CredentialAttestations {
    /// Create a new empty storage instance.
    pub fn new() -> Self {
        Self { map: BTreeMap::new() }
    }

    /// Add an attestation linking `hash` to `issuer`.
    /// Returns `true` if the attestation was newly inserted.
    pub fn attest(&mut self, hash: H256, issuer: Vec<u8>) -> bool {
        let issuers = self.map.entry(hash).or_default();
        issuers.insert(issuer)
    }

    /// Remove the attestation linking `hash` and `issuer`.
    /// Returns `true` if the attestation existed and was removed.
    pub fn revoke(&mut self, hash: H256, issuer: &[u8]) -> bool {
        if let Some(issuers) = self.map.get_mut(&hash) {
            let removed = issuers.remove(issuer);
            if issuers.is_empty() {
                self.map.remove(&hash);
            }
            removed
        } else {
            false
        }
    }

    /// Get all issuer DIDs associated with the `hash`.
    pub fn issuers(&self, hash: H256) -> Option<&BTreeSet<Vec<u8>>> {
        self.map.get(&hash)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn attest_and_revoke() {
        let mut store = CredentialAttestations::new();
        let vc_hash = H256::repeat_byte(1);
        let issuer_a = b"did:example:a".to_vec();
        let issuer_b = b"did:example:b".to_vec();

        assert!(store.attest(vc_hash, issuer_a.clone()));
        assert!(!store.attest(vc_hash, issuer_a.clone()));
        assert!(store.attest(vc_hash, issuer_b.clone()));

        let issuers = store.issuers(vc_hash).unwrap();
        assert_eq!(issuers.len(), 2);

        assert!(store.revoke(vc_hash, &issuer_a));
        assert!(!store.revoke(vc_hash, &issuer_a));
        assert!(store.revoke(vc_hash, &issuer_b));
        assert!(store.issuers(vc_hash).is_none());
    }
}
