#![cfg(test)]
use super::*;
use crate::mock::*;
use frame_support::{assert_noop, assert_ok};

#[test]
fn create_did_works() {
    new_test_ext().execute_with(|| {
        let did = b"did:chai:alice".to_vec();
        assert_ok!(Did::create(Origin::signed(1), did.clone()));

        // Verify storage
        let doc = Did::did_of(&did).expect("doc exists");
        assert_eq!(doc.controller, 1);
        assert!(!doc.deactivated);
    });
}

#[test]
fn add_and_remove_key_works() {
    new_test_ext().execute_with(|| {
        let did = b"did:chai:bob".to_vec();
        assert_ok!(Did::create(Origin::signed(2), did.clone()));

        let key_type = b"ed25519".to_vec();
        let pk = vec![1u8; 32];
        assert_ok!(Did::add_key(Origin::signed(2), did.clone(), key_type.clone(), pk));

        // Remove key
        assert_ok!(Did::remove_key(Origin::signed(2), did.clone(), key_type.clone()));

        // Removing again should fail
        assert_noop!(Did::remove_key(Origin::signed(2), did.clone(), key_type), Error::<Test>::DidNotFound);
    });
}

#[test]
fn add_and_remove_service_works() {
    new_test_ext().execute_with(|| {
        let did = b"did:chai:carol".to_vec();
        assert_ok!(Did::create(Origin::signed(3), did.clone()));

        let service = b"https://agent.example/didcomm".to_vec();
        assert_ok!(Did::add_service(Origin::signed(3), did.clone(), service));

        // Remove service at index 0
        assert_ok!(Did::remove_service(Origin::signed(3), did.clone(), 0));

        // Removing at index 0 again should error
        assert_noop!(Did::remove_service(Origin::signed(3), did, 0), Error::<Test>::IndexOutOfBounds);
    });
}

#[test]
fn deactivate_blocks_changes() {
    new_test_ext().execute_with(|| {
        let did = b"did:chai:dave".to_vec();
        assert_ok!(Did::create(Origin::signed(4), did.clone()));
        assert_ok!(Did::deactivate(Origin::signed(4), did.clone()));

        // Adding key after deactivation should fail
        let key_type = b"ed25519".to_vec();
        assert_noop!(
            Did::add_key(Origin::signed(4), did.clone(), key_type, vec![0u8; 32]),
            Error::<Test>::AlreadyDeactivated
        );
    });
}

