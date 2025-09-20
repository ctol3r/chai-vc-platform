-- Initialize CHAI Platform database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Credentials table
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_tx_id VARCHAR(255) UNIQUE NOT NULL,
    credential_data JSONB NOT NULL,
    issuer_address VARCHAR(255) NOT NULL,
    owner_address VARCHAR(255) NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_credentials_chain_tx_id ON credentials(chain_tx_id);
CREATE INDEX IF NOT EXISTS idx_credentials_issuer ON credentials(issuer_address);
CREATE INDEX IF NOT EXISTS idx_credentials_owner ON credentials(owner_address);

-- Trust registry entries
CREATE TABLE IF NOT EXISTS trust_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer_address VARCHAR(255) UNIQUE NOT NULL,
    authorized BOOLEAN DEFAULT TRUE,
    authorized_at TIMESTAMP DEFAULT NOW(),
    authorized_by VARCHAR(255)
);

-- ACA-Py status proofs
CREATE TABLE IF NOT EXISTS status_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID REFERENCES credentials(id),
    proof_data JSONB NOT NULL,
    proof_type VARCHAR(50) DEFAULT 'revocation_status',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data for development
INSERT INTO trust_registry (issuer_address, authorized, authorized_by) 
VALUES ('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', TRUE, 'system')
ON CONFLICT (issuer_address) DO NOTHING;
