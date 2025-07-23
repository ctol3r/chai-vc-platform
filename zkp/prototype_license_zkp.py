"""Prototype zero-knowledge proof for private license query.

This script demonstrates a very basic Schnorr identification proof where a prover
can prove knowledge of a secret (e.g. a license key) without revealing it. The
verifier only learns whether the prover actually knows the secret corresponding
to a public value.

This is **for demonstration only** and should not be used in production.
"""

import secrets

class SchnorrZKP:
    def __init__(self, p: int, g: int):
        self.p = p
        self.g = g
        self.q = p - 1  # group order (not secure, for demo only)

    def generate_keys(self):
        """Generate a secret/public key pair."""
        secret = secrets.randbelow(self.q)
        public = pow(self.g, secret, self.p)
        return secret, public

    def prove(self, secret: int, challenge: int):
        """Prover computes a response for the given challenge."""
        k = secrets.randbelow(self.q)
        t = pow(self.g, k, self.p)
        s = (k + challenge * secret) % self.q
        return t, s

    def verify(self, public: int, t: int, challenge: int, s: int) -> bool:
        left = pow(self.g, s, self.p)
        right = (t * pow(public, challenge, self.p)) % self.p
        return left == right

def demo():
    # Large prime for the group; small here for readability
    p = 208351617316091241234326746312124448251235562226470491514186331217050270460481
    g = 2
    scheme = SchnorrZKP(p, g)

    # Prover's secret (license key) and corresponding public value
    secret, public = scheme.generate_keys()

    # Verifier knows the public value and issues a random challenge
    challenge = secrets.randbelow(scheme.q)

    # Prover generates proof
    t, s = scheme.prove(secret, challenge)

    # Verifier checks the proof
    if scheme.verify(public, t, challenge, s):
        print("Proof verified: prover has the license")
    else:
        print("Proof failed: invalid license or wrong secret")

if __name__ == "__main__":
    demo()
