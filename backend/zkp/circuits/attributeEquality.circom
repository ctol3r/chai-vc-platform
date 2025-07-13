pragma circom 2.0.0;

// Simple circuit to prove that a secret attribute equals a public value

template AttributeEquality() {
    signal input attr;
    signal input expected;
    signal output isValid;

    isValid <== attr === expected;
}

component main = AttributeEquality();
