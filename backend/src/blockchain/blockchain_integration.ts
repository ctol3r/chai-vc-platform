import { ensureTrustedValidator } from './validator_guard';

export function startValidatorNode(): void {
    ensureTrustedValidator();
    // TODO: Initialize and start the blockchain validator node implementation
    console.log('Validator node started on trusted healthcare entity.');
}
