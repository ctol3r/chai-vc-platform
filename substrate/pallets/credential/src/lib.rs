#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{dispatch::DispatchResult, pallet_prelude::*};
use frame_system::pallet_prelude::*;
use sp_std::vec::Vec;

pub mod weights;
pub use weights::WeightInfo;
#[cfg(feature = "runtime-benchmarks")]
pub mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        /// Maximum length of a DID bytestring
        #[pallet::constant]
        type MaxDidLen: Get<u32>;
        /// Maximum length of a revocation reason bytestring
        #[pallet::constant]
        type MaxReasonLen: Get<u32>;
        /// Weight information for extrinsics
        type WeightInfo: WeightInfo;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn credentials)]
    pub type Credentials<T: Config> = StorageMap<_, Blake2_128Concat, T::Hash, Credential<T>>;

    #[pallet::storage]
    #[pallet::getter(fn owner_credentials)]
    pub type OwnerCredentials<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, Vec<T::Hash>, ValueQuery>;

    /// Index: issuer DID -> credential ids
    #[pallet::storage]
    #[pallet::getter(fn by_issuer)]
    pub type ByIssuer<T: Config> = StorageMap<_, Blake2_128Concat, BoundedVec<u8, T::MaxDidLen>, Vec<T::Hash>, ValueQuery>;

    /// Index: subject DID -> credential ids
    #[pallet::storage]
    #[pallet::getter(fn by_subject)]
    pub type BySubject<T: Config> = StorageMap<_, Blake2_128Concat, BoundedVec<u8, T::MaxDidLen>, Vec<T::Hash>, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(fn deposit_event)]
    pub enum Event<T: Config> {
        CredentialIssued { id: T::Hash, owner: T::AccountId, issuer_did: Vec<u8>, subject_did: Vec<u8> },
        CredentialUpdated { id: T::Hash },
        CredentialRevoked { id: T::Hash, reason: Vec<u8> },
    }

    #[pallet::error]
    pub enum Error<T> {
        CredentialNotFound,
        NotCredentialOwner,
        DidTooLong,
        ReasonTooLong,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(T::WeightInfo::issue_credential(issuer_did.len() as u32, subject_did.len() as u32, data.len() as u32))]
        pub fn issue_credential(
            origin: OriginFor<T>,
            data: Vec<u8>,
            issuer_did: Vec<u8>,
            subject_did: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let issuer_bv: BoundedVec<u8, T::MaxDidLen> = issuer_did.clone().try_into().map_err(|_| Error::<T>::DidTooLong)?;
            let subject_bv: BoundedVec<u8, T::MaxDidLen> = subject_did.clone().try_into().map_err(|_| Error::<T>::DidTooLong)?;
            let credential = Credential {
                owner: who.clone(),
                data: data.clone(),
                revoked: false,
                issuer_did: issuer_bv.clone(),
                subject_did: subject_bv.clone(),
                revocation_reason: None,
            };
            let id = T::Hashing::hash_of(&credential);
            Credentials::<T>::insert(id, &credential);
            OwnerCredentials::<T>::mutate(&who, |list| list.push(id));
            ByIssuer::<T>::mutate(&issuer_bv, |list| list.push(id));
            BySubject::<T>::mutate(&subject_bv, |list| list.push(id));
            Self::deposit_event(Event::CredentialIssued { id, owner: who, issuer_did: issuer_bv.into_inner(), subject_did: subject_bv.into_inner() });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::update_credential(new_data.len() as u32))]
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

        #[pallet::weight(T::WeightInfo::revoke_credential(reason.len() as u32))]
        pub fn revoke_credential(
            origin: OriginFor<T>,
            id: T::Hash,
            reason: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Credentials::<T>::try_mutate(id, |cred| -> DispatchResult {
                let mut credential = cred.as_mut().ok_or(Error::<T>::CredentialNotFound)?;
                ensure!(credential.owner == who, Error::<T>::NotCredentialOwner);
                credential.revoked = true;
                let reason_bv: BoundedVec<u8, T::MaxReasonLen> = reason.clone().try_into().map_err(|_| Error::<T>::ReasonTooLong)?;
                credential.revocation_reason = Some(reason_bv.clone());
                Self::deposit_event(Event::CredentialRevoked { id, reason: reason_bv.into_inner() });
                Ok(())
            })
        }
    }

    #[derive(Encode, Decode, Clone, PartialEq, Eq, TypeInfo, MaxEncodedLen)]
    pub struct Credential<T: Config> {
        pub owner: T::AccountId,
        pub data: Vec<u8>,
        pub revoked: bool,
        pub issuer_did: BoundedVec<u8, T::MaxDidLen>,
        pub subject_did: BoundedVec<u8, T::MaxDidLen>,
        pub revocation_reason: Option<BoundedVec<u8, T::MaxReasonLen>>,
    }
}
