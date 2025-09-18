#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod tests;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{dispatch::DispatchResult, pallet_prelude::*, traits::EnsureOrigin};
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn did_documents)]
    pub type DidDocuments<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, DidDocument, OptionQuery>;

    #[derive(Encode, Decode, Clone, RuntimeDebug, PartialEq, Eq, TypeInfo)]
    pub struct DidDocument {
        pub id: Vec<u8>,          // DID string
        pub public_key: Vec<u8>,  // public key bytes
        pub metadata: Vec<u8>,    // optional metadata (JSON)
        pub active: bool,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        DidCreated(T::AccountId, Vec<u8>),
        DidUpdated(T::AccountId, Vec<u8>),
        DidDeactivated(T::AccountId, Vec<u8>),
    }

    #[pallet::error]
    pub enum Error<T> {
        AlreadyExists,
        NotFound,
        NotAuthorized,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn create_did(origin: OriginFor<T>, id: Vec<u8>, public_key: Vec<u8>, metadata: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(!DidDocuments::<T>::contains_key(&who), Error::<T>::AlreadyExists);

            let doc = DidDocument { id: id.clone(), public_key, metadata, active: true };
            DidDocuments::<T>::insert(&who, doc);
            Self::deposit_event(Event::DidCreated(who, id));
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn update_did(origin: OriginFor<T>, id: Vec<u8>, public_key: Vec<u8>, metadata: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            DidDocuments::<T>::try_mutate(&who, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::NotFound)?;
                doc.id = id.clone();
                doc.public_key = public_key;
                doc.metadata = metadata;
                Self::deposit_event(Event::DidUpdated(who.clone(), id));
                Ok(())
            })
        }

        #[pallet::weight(10_000)]
        pub fn deactivate_did(origin: OriginFor<T>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            DidDocuments::<T>::try_mutate(&who, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::NotFound)?;
                doc.active = false;
                Self::deposit_event(Event::DidDeactivated(who.clone(), doc.id.clone()));
                Ok(())
            })
        }
    }
}