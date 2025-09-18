#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod tests;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        dispatch::DispatchResult,
        pallet_prelude::*,
        traits::{Get, EnsureOrigin},
    };
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// Maximum length of credential hash
        type MaxHashLength: Get<u32>;

        /// Maximum length of revocation reason
        type MaxRevocationReason: Get<u32>;

        /// Maximum credentials per issuer
        type MaxCredentialsPerIssuer: Get<u32>;

        /// Origin that can manage trust registry
        type TrustRegistryOrigin: EnsureOrigin<Self::RuntimeOrigin>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[derive(Encode, Decode, Clone, RuntimeDebug, PartialEq, Eq, TypeInfo)]
    pub enum CredentialStatus {
        Active,
        Revoked,
        Expired,
        Suspended,
    }

    #[derive(Encode, Decode, Clone, RuntimeDebug, PartialEq, Eq, TypeInfo)]
    pub struct CredentialRecord<AccountId, BlockNumber> {
        pub issuer: AccountId,
        pub status: CredentialStatus,
        pub issued_at: BlockNumber,
        pub updated_at: BlockNumber,
        pub revocation_reason: Option<Vec<u8>>,
    }

    /// Credential storage: hash -> record
    #[pallet::storage]
    #[pallet::getter(fn credentials)]
    pub type Credentials<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        Vec<u8>, // credential hash
        CredentialRecord<T::AccountId, BlockNumberFor<T>>,
        OptionQuery,
    >;

    /// Trust registry: authorized issuers
    #[pallet::storage]
    #[pallet::getter(fn authorized_issuers)]
    pub type AuthorizedIssuers<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, bool, ValueQuery>;

    /// Issuer credentials index: issuer -> list of credential hashes
    #[pallet::storage]
    #[pallet::getter(fn issuer_credentials)]
    pub type IssuerCredentials<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<Vec<u8>, T::MaxCredentialsPerIssuer>,
        ValueQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Credential issued [issuer, hash]
        CredentialIssued(T::AccountId, Vec<u8>),
        /// Credential revoked [issuer, hash, reason]
        CredentialRevoked(T::AccountId, Vec<u8>, Option<Vec<u8>>),
        /// Credential expired [issuer, hash]
        CredentialExpired(T::AccountId, Vec<u8>),
        /// Credential suspended [issuer, hash, reason]
        CredentialSuspended(T::AccountId, Vec<u8>, Option<Vec<u8>>),
        /// Issuer authorized [issuer]
        IssuerAuthorized(T::AccountId),
        /// Issuer deauthorized [issuer]
        IssuerDeauthorized(T::AccountId),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Credential already exists
        AlreadyExists,
        /// Credential not found
        NotFound,
        /// Not authorized to perform this action
        NotAuthorized,
        /// Issuer not in trust registry
        IssuerNotAuthorized,
        /// Invalid hash length
        InvalidHashLength,
        /// Revocation reason too long
        RevocationReasonTooLong,
        /// Cannot modify revoked credential
        CredentialRevoked,
        /// Cannot modify expired credential
        CredentialExpired,
        /// Too many credentials for issuer
        TooManyCredentials,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Issue a new credential
        #[pallet::weight(10_000)]
        pub fn issue_credential(
            origin: OriginFor<T>,
            hash: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // Validate hash length
            ensure!(
                hash.len() <= T::MaxHashLength::get() as usize && !hash.is_empty(),
                Error::<T>::InvalidHashLength
            );

            // Check if issuer is authorized
            ensure!(
                Self::authorized_issuers(&who),
                Error::<T>::IssuerNotAuthorized
            );

            // Ensure credential doesn't exist
            ensure!(
                !Credentials::<T>::contains_key(&hash),
                Error::<T>::AlreadyExists
            );

            let current_block = frame_system::Pallet::<T>::block_number();
            let record = CredentialRecord {
                issuer: who.clone(),
                status: CredentialStatus::Active,
                issued_at: current_block,
                updated_at: current_block,
                revocation_reason: None,
            };

            Credentials::<T>::insert(&hash, &record);

            // Add to issuer's credential list
            IssuerCredentials::<T>::try_mutate(&who, |creds| -> DispatchResult {
                creds.try_push(hash.clone())
                    .map_err(|_| Error::<T>::TooManyCredentials)?;
                Ok(())
            })?;

            Self::deposit_event(Event::CredentialIssued(who, hash));
            Ok(())
        }

        /// Revoke a credential
        #[pallet::weight(10_000)]
        pub fn revoke_credential(
            origin: OriginFor<T>,
            hash: Vec<u8>,
            reason: Option<Vec<u8>>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // Validate reason length
            if let Some(ref reason_bytes) = reason {
                ensure!(
                    reason_bytes.len() <= T::MaxRevocationReason::get() as usize,
                    Error::<T>::RevocationReasonTooLong
                );
            }

            Credentials::<T>::try_mutate(&hash, |maybe_record| -> DispatchResult {
                let record = maybe_record.as_mut().ok_or(Error::<T>::NotFound)?;

                // Only issuer can revoke their own credentials
                ensure!(record.issuer == who, Error::<T>::NotAuthorized);

                // Cannot revoke already revoked/expired credentials
                match record.status {
                    CredentialStatus::Revoked => return Err(Error::<T>::CredentialRevoked.into()),
                    CredentialStatus::Expired => return Err(Error::<T>::CredentialExpired.into()),
                    _ => {}
                }

                record.status = CredentialStatus::Revoked;
                record.updated_at = frame_system::Pallet::<T>::block_number();
                record.revocation_reason = reason.clone();

                Self::deposit_event(Event::CredentialRevoked(who.clone(), hash.clone(), reason));
                Ok(())
            })
        }

        /// Mark credential as expired
        #[pallet::weight(10_000)]
        pub fn expire_credential(
            origin: OriginFor<T>,
            hash: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            Credentials::<T>::try_mutate(&hash, |maybe_record| -> DispatchResult {
                let record = maybe_record.as_mut().ok_or(Error::<T>::NotFound)?;

                // Only issuer can expire their own credentials
                ensure!(record.issuer == who, Error::<T>::NotAuthorized);

                match record.status {
                    CredentialStatus::Revoked => return Err(Error::<T>::CredentialRevoked.into()),
                    CredentialStatus::Expired => return Ok(()), // Already expired, no-op
                    _ => {}
                }

                record.status = CredentialStatus::Expired;
                record.updated_at = frame_system::Pallet::<T>::block_number();

                Self::deposit_event(Event::CredentialExpired(who.clone(), hash.clone()));
                Ok(())
            })
        }

        /// Authorize an issuer (Trust Registry management)
        #[pallet::weight(10_000)]
        pub fn authorize_issuer(
            origin: OriginFor<T>,
            issuer: T::AccountId,
        ) -> DispatchResult {
            T::TrustRegistryOrigin::ensure_origin(origin)?;

            AuthorizedIssuers::<T>::insert(&issuer, true);
            Self::deposit_event(Event::IssuerAuthorized(issuer));
            Ok(())
        }

        /// Deauthorize an issuer
        #[pallet::weight(10_000)]
        pub fn deauthorize_issuer(
            origin: OriginFor<T>,
            issuer: T::AccountId,
        ) -> DispatchResult {
            T::TrustRegistryOrigin::ensure_origin(origin)?;

            AuthorizedIssuers::<T>::remove(&issuer);
            Self::deposit_event(Event::IssuerDeauthorized(issuer));
            Ok(())
        }
    }

    // Helper functions
    impl<T: Config> Pallet<T> {
        /// Check if a credential exists and is active
        pub fn is_credential_active(hash: &[u8]) -> bool {
            if let Some(record) = Self::credentials(hash) {
                matches!(record.status, CredentialStatus::Active)
            } else {
                false
            }
        }

        /// Get credential status
        pub fn get_credential_status(hash: &[u8]) -> Option<CredentialStatus> {
            Self::credentials(hash).map(|record| record.status)
        }
    }
}