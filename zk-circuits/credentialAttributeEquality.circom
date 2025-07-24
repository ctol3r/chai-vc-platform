include "circomlib/poseidon.circom";

// CredentialAttributeEquality checks that the Poseidon hash of all
// credential attributes matches the provided commitment and that the
// attribute at a fixed index equals the expected value without revealing
// other attributes.

template CredentialAttributeEquality(N, IDX) {
    // Private credential attributes
    signal input attrs[N];

    // Public Poseidon commitment to all attributes
    signal input commitment;

    // Public value that the attribute at IDX must equal
    signal input expected;

    // Recompute Poseidon hash and enforce it matches the commitment
    component hash = Poseidon(N);
    for (var i = 0; i < N; i++) {
        hash.inputs[i] <== attrs[i];
    }
    hash.out === commitment;

    // Prove that the attribute at index IDX equals the expected value
    attrs[IDX] === expected;
}

// Default circuit instance: four attributes, proving the first attribute
component main = CredentialAttributeEquality(4, 0);
