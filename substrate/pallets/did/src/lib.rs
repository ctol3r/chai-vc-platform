#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{pallet_prelude::*, traits::EnsureOrigin};
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type SubmitOrigin: EnsureOrigin<Self::RuntimeOrigin, Success = Self::AccountId>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn did_documents)]
    #[pallet::unbounded]
    pub type DidDocuments<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, Vec<u8>, OptionQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        DidSet { owner: T::AccountId, document: Vec<u8> },
        DidCleared { owner: T::AccountId },
    }

    #[pallet::error]
    pub enum Error<T> {
        DocumentTooLarge,
        DocumentMissing,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn upsert(origin: OriginFor<T>, document: Vec<u8>) -> DispatchResult {
            let owner = T::SubmitOrigin::ensure_origin(origin)?;
            ensure!(document.len() <= 4 * 1024, Error::<T>::DocumentTooLarge);
            DidDocuments::<T>::insert(&owner, document.clone());
            Self::deposit_event(Event::DidSet { owner, document });
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn clear(origin: OriginFor<T>) -> DispatchResult {
            let owner = T::SubmitOrigin::ensure_origin(origin)?;
            ensure!(DidDocuments::<T>::take(&owner).is_some(), Error::<T>::DocumentMissing);
            Self::deposit_event(Event::DidCleared { owner });
            Ok(())
        }
    }
}
