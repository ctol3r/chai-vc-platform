# Substrate Pallets Integration Guide

This repo contains FRAME pallets that can be integrated into a Substrate runtime. Notably, `pallet-did` provides basic DID document management (create, add/remove key, add/remove service, deactivate).

## Add `pallet-did` to your runtime

1. Runtime `Cargo.toml`:

```
[dependencies]
pallet-did = { path = "../../substrate/pallets/did", default-features = false }

[features]
std = [
  # ... existing
  "pallet-did/std",
]
```

2. Runtime `lib.rs`:

```
impl pallet_did::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
}

construct_runtime!(
  pub enum Runtime where
    // ...
  {
    System: frame_system,
    // ...
    Did: pallet_did,
  }
);
```

3. Build and run your node, then call extrinsics via Polkadot-JS Apps:
- `did.create(didBytes)`
- `did.add_key(didBytes, keyTypeBytes, publicKeyBytes)`
- `did.remove_key(didBytes, keyTypeBytes)`
- `did.add_service(didBytes, serviceUriBytes)`
- `did.remove_service(didBytes, index)`
- `did.deactivate(didBytes)`

## Testing the pallet in isolation

From `substrate/pallets/did`:

```
cargo test -p pallet-did
```

This runs integration tests using a mock runtime to exercise `create`, `add_key`, `add_service`, `remove_service`, and `deactivate` extrinsics.

## Notes
- Storage keys are minimal and subject to change in future iterations.
- Key and service limits are bounded to keep weights predictable.
- Consider adding benchmarking and weights before production use.
