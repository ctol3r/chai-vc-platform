use super::*;
use crate::{mock::*, Error};
use frame_support::{assert_noop, assert_ok, dispatch::DispatchError};

#[test]
fn root_can_authorize_and_deauthorize_issuer() {
    new_test_ext().execute_with(|| {
        assert_ok!(CredentialPallet::authorize_issuer(
            RuntimeOrigin::root(),
            42
        ));
        assert!(CredentialPallet::is_authorized_issuer(&42));

        assert_ok!(CredentialPallet::deauthorize_issuer(
            RuntimeOrigin::root(),
            42
        ));
        assert!(!CredentialPallet::is_authorized_issuer(&42));
    });
}

#[test]
fn non_root_cannot_authorize() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            CredentialPallet::authorize_issuer(RuntimeOrigin::signed(7), 42),
            DispatchError::BadOrigin
        );
    });
}

#[test]
fn issue_and_revoke_flow() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            CredentialPallet::issue_credential(RuntimeOrigin::signed(1), b"cred".to_vec()),
            Error::<Test>::IssuerNotAuthorized
        );

        assert_ok!(CredentialPallet::authorize_issuer(RuntimeOrigin::root(), 1));

        let data = b"cred".to_vec();
        assert_ok!(CredentialPallet::issue_credential(
            RuntimeOrigin::signed(1),
            data.clone()
        ));

        let ids = CredentialPallet::owner_credentials(1);
        assert_eq!(ids.len(), 1);
        let credential_id = ids[0];

        let stored = CredentialPallet::credentials(credential_id).expect("stored credential");
        assert_eq!(stored.owner, 1);
        assert_eq!(stored.data, data);
        assert!(!stored.revoked);

        assert_noop!(
            CredentialPallet::revoke_credential(RuntimeOrigin::signed(2), credential_id),
            Error::<Test>::NotCredentialOwner
        );

        assert_ok!(CredentialPallet::revoke_credential(
            RuntimeOrigin::signed(1),
            credential_id
        ));
        let revoked = CredentialPallet::credentials(credential_id).expect("revoked credential");
        assert!(revoked.revoked);
    });
}
