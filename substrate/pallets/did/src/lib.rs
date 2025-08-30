#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

pub mod weights;
pub use weights::WeightInfo;
#[cfg(feature = "runtime-benchmarks")]
pub mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{dispatch::DispatchResult, pallet_prelude::*};
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub struct DidKey {
        pub key_type: Vec<u8>,
        pub public_key: Vec<u8>,
    }

    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub struct DidDocument<AccountId> {
        pub controller: AccountId,
        pub keys: BoundedVec<DidKey, ConstU32<16>>,
        pub services: BoundedVec<Vec<u8>, ConstU32<16>>,
        pub deactivated: bool,
    }

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        /// Weight information for extrinsics
        type WeightInfo: WeightInfo;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn did_of)]
    pub type Dids<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, DidDocument<T::AccountId>>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        DidCreated { did: Vec<u8> },
        KeyAdded { did: Vec<u8>, key_type: Vec<u8> },
        KeyRemoved { did: Vec<u8>, key_type: Vec<u8> },
        ServiceAdded { did: Vec<u8> },
        ServiceRemoved { did: Vec<u8> },
        DidDeactivated { did: Vec<u8> },
    }

    #[pallet::error]
    pub enum Error<T> {
        DidExists,
        DidNotFound,
        NotController,
        TooManyKeys,
        TooManyServices,
        AlreadyDeactivated,
        IndexOutOfBounds,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(T::WeightInfo::create(did.len() as u32))]
        pub fn create(origin: OriginFor<T>, did: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(!Dids::<T>::contains_key(&did), Error::<T>::DidExists);
            let doc = DidDocument::<T::AccountId> {
                controller: who,
                keys: BoundedVec::default(),
                services: BoundedVec::default(),
                deactivated: false,
            };
            Dids::<T>::insert(&did, doc);
            Self::deposit_event(Event::DidCreated { did });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::add_key(did.len() as u32, key_type.len() as u32, public_key.len() as u32))]
        pub fn add_key(origin: OriginFor<T>, did: Vec<u8>, key_type: Vec<u8>, public_key: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Dids::<T>::try_mutate(&did, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::DidNotFound)?;
                ensure!(doc.controller == who, Error::<T>::NotController);
                ensure!(!doc.deactivated, Error::<T>::AlreadyDeactivated);
                let key = DidKey { key_type: key_type.clone(), public_key };
                doc.keys.try_push(key).map_err(|_| Error::<T>::TooManyKeys)?;
                Ok(())
            })?;
            Self::deposit_event(Event::KeyAdded { did, key_type });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::remove_key(did.len() as u32, key_type.len() as u32))]
        pub fn remove_key(origin: OriginFor<T>, did: Vec<u8>, key_type: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Dids::<T>::try_mutate(&did, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::DidNotFound)?;
                ensure!(doc.controller == who, Error::<T>::NotController);
                ensure!(!doc.deactivated, Error::<T>::AlreadyDeactivated);
                if let Some(pos) = doc.keys.iter().position(|k| k.key_type == key_type) {
                    doc.keys.swap_remove(pos);
                    Ok(())
                } else {
                    Err(Error::<T>::DidNotFound.into())
                }
            })?;
            Self::deposit_event(Event::KeyRemoved { did, key_type });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::add_service(did.len() as u32, service_uri.len() as u32))]
        pub fn add_service(origin: OriginFor<T>, did: Vec<u8>, service_uri: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Dids::<T>::try_mutate(&did, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::DidNotFound)?;
                ensure!(doc.controller == who, Error::<T>::NotController);
                ensure!(!doc.deactivated, Error::<T>::AlreadyDeactivated);
                doc.services.try_push(service_uri).map_err(|_| Error::<T>::TooManyServices)?;
                Ok(())
            })?;
            Self::deposit_event(Event::ServiceAdded { did });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::remove_service(did.len() as u32))]
        pub fn remove_service(origin: OriginFor<T>, did: Vec<u8>, index: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Dids::<T>::try_mutate(&did, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::DidNotFound)?;
                ensure!(doc.controller == who, Error::<T>::NotController);
                ensure!(!doc.deactivated, Error::<T>::AlreadyDeactivated);
                let idx = index as usize;
                ensure!(idx < doc.services.len(), Error::<T>::IndexOutOfBounds);
                doc.services.swap_remove(idx);
                Ok(())
            })?;
            Self::deposit_event(Event::ServiceRemoved { did });
            Ok(())
        }

        #[pallet::weight(T::WeightInfo::deactivate(did.len() as u32))]
        pub fn deactivate(origin: OriginFor<T>, did: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Dids::<T>::try_mutate(&did, |maybe_doc| -> DispatchResult {
                let doc = maybe_doc.as_mut().ok_or(Error::<T>::DidNotFound)?;
                ensure!(doc.controller == who, Error::<T>::NotController);
                ensure!(!doc.deactivated, Error::<T>::AlreadyDeactivated);
                doc.deactivated = true;
                Ok(())
            })?;
            Self::deposit_event(Event::DidDeactivated { did });
            Ok(())
        }
    }
}

#[cfg(test)]
mod mock;
#[cfg(test)]
mod tests;
