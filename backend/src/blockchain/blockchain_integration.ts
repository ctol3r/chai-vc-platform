import { bridgeToEvmContract, bridgeToWasmContract, UpgradePath } from './upgrade_paths';

/**
 * Obtain upgrade paths for the given target platform.
 * This function demonstrates how the backend can prepare
 * migrations for both EVM and WASM targets in a chain-agnostic way.
 */
export function getUpgradePath(target: 'EVM' | 'WASM', identifier: string): UpgradePath {
  if (target === 'EVM') {
    return bridgeToEvmContract(identifier);
  }
  return bridgeToWasmContract(identifier);
}
