# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Database Encryption

PII fields are encrypted at the column level using PostgreSQL's `pgcrypto` extension. The migration at `backend/prisma/migrations/001_enable_pgcrypto.sql` installs the extension, creates an example `users` table and sets up a trigger so that `email` and `ssn` values are symmetrically encrypted before insert or update.

Before running the migration, set a database parameter for the encryption key, e.g.

```sql
ALTER SYSTEM SET app.encryption_key = 'replace-with-secure-key';
SELECT pg_reload_conf();
```

Data can be decrypted in queries using `pgp_sym_decrypt`:

```sql
SELECT
  id,
  pgp_sym_decrypt(email, current_setting('app.encryption_key')) AS email,
  pgp_sym_decrypt(ssn, current_setting('app.encryption_key')) AS ssn
FROM users;
```
