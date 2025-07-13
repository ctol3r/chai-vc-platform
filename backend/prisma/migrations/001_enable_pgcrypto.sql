CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example users table with PII encrypted at the column level
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email BYTEA NOT NULL,
    ssn BYTEA NOT NULL
);

-- Trigger to automatically encrypt PII columns using pgcrypto
CREATE OR REPLACE FUNCTION encrypt_user_pii() RETURNS TRIGGER AS $$
BEGIN
    NEW.email := pgp_sym_encrypt(NEW.email::text, current_setting('app.encryption_key'));
    NEW.ssn := pgp_sym_encrypt(NEW.ssn::text, current_setting('app.encryption_key'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_encrypt_user_pii
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION encrypt_user_pii();
