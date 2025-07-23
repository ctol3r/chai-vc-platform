#!/bin/bash
# Run the Dilithium-only testnet
set -e
REPO=${1:-https://github.com/example/chai-node.git}
BRANCH=${2:-dilithium-only-testnet}
DIR=${3:-dilithium-testnet}

if [ ! -d "$DIR" ]; then
  git clone "$REPO" "$DIR"
fi
cd "$DIR"

git fetch origin "$BRANCH"

git checkout "$BRANCH"

if [ ! -f target/release/chai-node ]; then
  cargo build --release
fi

./target/release/chai-node --chain dilithium_testnet
