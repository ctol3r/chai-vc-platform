#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{dispatch::DispatchResult, pallet_prelude::*, traits::EnsureOrigin};
use frame_system::pallet_prelude::*;
use sp_runtime::traits::Hash;
use sp_std::vec::Vec;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type TrustRegistryOrigin: EnsureOrigin<Self::RuntimeOrigin>;
        type MaxRevocationReason: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn authorized_issuers)]
    pub type AuthorizedIssuers<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, (), OptionQuery>;

    #[pallet::storage]
    #[pallet::getter(fn credentials)]
    #[pallet::unbounded]
    pub type Credentials<T: Config> = StorageMap<_, Blake2_128Concat, T::Hash, Credential<T>>;

    #[pallet::storage]
    #[pallet::getter(fn owner_credentials)]
    #[pallet::unbounded]
    pub type OwnerCredentials<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, Vec<T::Hash>, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(fn deposit_event)]
    pub enum Event<T: Config> {
        CredentialIssued { id: T::Hash, owner: T::AccountId },
        CredentialUpdated { id: T::Hash },
        CredentialRevoked { id: T::Hash },
        IssuerAuthorized { account: T::AccountId },
        IssuerDeauthorized { account: T::AccountId },
    }

    #[pallet::error]
    pub enum Error<T> {
        CredentialNotFound,
        NotCredentialOwner,
        IssuerAlreadyAuthorized,
        IssuerNotAuthorized,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn authorize_issuer(origin: OriginFor<T>, account: T::AccountId) -> DispatchResult {
            T::TrustRegistryOrigin::ensure_origin(origin)?;
            ensure!(
                !AuthorizedIssuers::<T>::contains_key(&account),
                Error::<T>::IssuerAlreadyAuthorized
            );
            AuthorizedIssuers::<T>::insert(&account, ());
            Self::deposit_event(Event::IssuerAuthorized { account });
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn deauthorize_issuer(origin: OriginFor<T>, account: T::AccountId) -> DispatchResult {
            T::TrustRegistryOrigin::ensure_origin(origin)?;
            ensure!(
                AuthorizedIssuers::<T>::contains_key(&account),
                Error::<T>::IssuerNotAuthorized
            );
            AuthorizedIssuers::<T>::remove(&account);
            Self::deposit_event(Event::IssuerDeauthorized { account });
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn issue_credential(origin: OriginFor<T>, data: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;

            ensure!(
                AuthorizedIssuers::<T>::contains_key(&who),
                Error::<T>::IssuerNotAuthorized
            );

            let credential = Credential {
                owner: who.clone(),
                data: data.clone(),
                revoked: false,
            };
            let id = T::Hashing::hash_of(&credential);
            Credentials::<T>::insert(id, &credential);
            OwnerCredentials::<T>::mutate(&who, |list| list.push(id));
            Self::deposit_event(Event::CredentialIssued { id, owner: who });
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn update_credential(
            origin: OriginFor<T>,
            id: T::Hash,
            new_data: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Credentials::<T>::try_mutate(id, |cred| -> DispatchResult {
                let mut credential = cred.as_mut().ok_or(Error::<T>::CredentialNotFound)?;
                ensure!(credential.owner == who, Error::<T>::NotCredentialOwner);
                credential.data = new_data;
                Self::deposit_event(Event::CredentialUpdated { id });
                Ok(())
            })
        }

        #[pallet::weight(10_000)]
        pub fn revoke_credential(origin: OriginFor<T>, id: T::Hash) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Credentials::<T>::try_mutate(id, |cred| -> DispatchResult {
                let mut credential = cred.as_mut().ok_or(Error::<T>::CredentialNotFound)?;
                ensure!(credential.owner == who, Error::<T>::NotCredentialOwner);
                credential.revoked = true;
                Self::deposit_event(Event::CredentialRevoked { id });
                Ok(())
            })
        }
    }

    impl<T: Config> Pallet<T> {
        pub fn is_authorized(account: &T::AccountId) -> bool {
            AuthorizedIssuers::<T>::contains_key(account)
        }

        pub fn is_authorized_issuer(account: &T::AccountId) -> bool {
            Self::is_authorized(account)
        }
    }

    #[derive(Encode, Decode, Clone, PartialEq, Eq, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Credential<T: Config> {
        pub owner: T::AccountId,
        pub data: Vec<u8>,
        pub revoked: bool,
    }
}

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

pub use self::pallet::*;
