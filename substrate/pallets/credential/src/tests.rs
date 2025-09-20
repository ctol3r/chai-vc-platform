use super::*;
use crate::mock::{new_test_ext, Credential, RuntimeEvent, RuntimeOrigin, System, Test};
use frame_support::{assert_noop, assert_ok};
use frame_system::pallet_prelude::BadOrigin;

#[test]
fn authorize_issuer_requires_root() {
    new_test_ext().execute_with(|| {
        assert_ok!(Credential::authorize_issuer(RuntimeOrigin::root(), 42));
        assert!(Credential::is_authorized(&42));
        System::assert_last_event(RuntimeEvent::Credential(
            crate::Event::<Test>::IssuerAuthorized { account: 42 },
        ));
    });
}

#[test]
fn authorize_issuer_rejects_non_root() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            Credential::authorize_issuer(RuntimeOrigin::signed(1), 42),
            BadOrigin
        );
    });
}

#[test]
fn deauthorize_issuer_requires_root() {
    new_test_ext().execute_with(|| {
        assert_ok!(Credential::authorize_issuer(RuntimeOrigin::root(), 7));
        assert_ok!(Credential::deauthorize_issuer(RuntimeOrigin::root(), 7));
        System::assert_last_event(RuntimeEvent::Credential(
            crate::Event::<Test>::IssuerDeauthorized { account: 7 },
        ));
        assert!(!Credential::is_authorized(&7));
    });
}

#[test]
fn deauthorize_issuer_rejects_non_root() {
    new_test_ext().execute_with(|| {
        assert_ok!(Credential::authorize_issuer(RuntimeOrigin::root(), 9));
        assert_noop!(
            Credential::deauthorize_issuer(RuntimeOrigin::signed(1), 9),
            BadOrigin
        );
    });
}
