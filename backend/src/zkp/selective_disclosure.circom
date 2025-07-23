pragma circom 2.0.0;
include "circomlib/poseidon.circom";

template SelectiveDisclosure(n) {
    signal input attributes[n];
    signal input revealIndexes[n];
    signal input reveals[n];
    signal output hashOut;

    var i;
    component poseidon = Poseidon(n);

    for (i = 0; i < n; i++) {
        signal diff;
        diff <== attributes[i] - reveals[i];
        diff * revealIndexes[i] === 0;
    }

    for (i = 0; i < n; i++) {
        poseidon.inputs[i] <== attributes[i];
    }

    hashOut <== poseidon.out;
}

component main = SelectiveDisclosure(4);
