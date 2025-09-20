#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{construct_runtime, parameter_types, traits::ConstU32, traits::Everything};
use frame_system::limits::{BlockLength, BlockWeights};
use sp_core::H256;
use sp_runtime::{
    generic,
    traits::{AccountIdLookup, BlakeTwo256, IdentifyAccount, Verify},
    MultiSignature, OpaqueExtrinsic,
};
use sp_version::RuntimeVersion;

pub type Signature = MultiSignature;
pub type AccountId = <<Signature as Verify>::Signer as IdentifyAccount>::AccountId;
pub type BlockNumber = u32;
pub type Index = u32;
pub type Hash = H256;
pub type Header = generic::Header<BlockNumber, BlakeTwo256>;
pub type UncheckedExtrinsic = OpaqueExtrinsic;
pub type Block = generic::Block<Header, UncheckedExtrinsic>;

pub const VERSION: RuntimeVersion = RuntimeVersion {
    spec_name: sp_runtime::create_runtime_str!("mvp-lock-runtime"),
    impl_name: sp_runtime::create_runtime_str!("mvp-lock-runtime"),
    authoring_version: 1,
    spec_version: 1,
    impl_version: 1,
    apis: sp_std::vec![],
    transaction_version: 1,
    state_version: 1,
};

parameter_types! {
    pub const BlockHashCount: u64 = 240;
    pub BlockWeights: BlockWeights = BlockWeights::simple_max(2_000_000_000);
    pub BlockLength: BlockLength = BlockLength::max_with_normal_ratio(5 * 1024 * 1024, 75);
    pub const SS58Prefix: u16 = 42;
    pub const Version: RuntimeVersion = VERSION;
}

construct_runtime!(
    pub enum Runtime where
        Block = Block,
        NodeBlock = Block,
        UncheckedExtrinsic = UncheckedExtrinsic,
    {
        System: frame_system,
        DidPallet: pallet_did,
        CredentialPallet: pallet_credential,
    }
);

impl frame_system::Config for Runtime {
    type BaseCallFilter = Everything;
    type BlockWeights = BlockWeights;
    type BlockLength = BlockLength;
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Index = Index;
    type BlockNumber = BlockNumber;
    type Hash = Hash;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = AccountIdLookup<AccountId, ()>;
    type Header = Header;
    type RuntimeEvent = RuntimeEvent;
    type BlockHashCount = BlockHashCount;
    type Version = Version;
    type PalletInfo = PalletInfo;
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = SS58Prefix;
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
}

impl pallet_did::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type SubmitOrigin = frame_system::EnsureRoot<AccountId>;
}

impl pallet_credential::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type TrustRegistryOrigin = frame_system::EnsureRoot<AccountId>;
    type MaxRevocationReason = ConstU32<256>;
}
